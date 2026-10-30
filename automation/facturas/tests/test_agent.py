from dataclasses import replace
from decimal import Decimal
from io import BytesIO
from pathlib import Path
from types import SimpleNamespace
import tempfile
import time
import unittest
from unittest.mock import Mock, patch

import httpx
from pydantic import ValidationError
from automation.facturas.config import Settings, PRIMARY_MODEL, DEFAULT_FALLBACKS, ConfigurationError
from automation.facturas.documents import Document, DocumentError, extract_document, read_snapshot
from automation.facturas.models import ModelRouter, ProcessingError, classify_error
from automation.facturas.schema import Invoice
from automation.facturas.storage import Store, StorageError
from automation.facturas.worker import Worker


def settings(folder=Path('.')):
    return Settings(folder, 'test-only', 'https://example.invalid', 'test-only', (PRIMARY_MODEL, *DEFAULT_FALLBACKS), retries=1)


def payload(**changes):
    return dict(numero_factura='FAC-001', fecha_emision='2026-10-23', proveedor_nombre='Proveedor ficticio', proveedor_identificacion='B12345678',
        base_imponible=100, impuestos=[dict(nombre='IVA', porcentaje=21, importe=21)], importe_total=121, moneda='EUR', observaciones=None, **{}) | changes


def provider_error(status, text='provider unavailable'):
    error = RuntimeError(text)
    error.status_code = status
    return error


def router(invoke, cfg=None):
    result = ModelRouter(cfg or settings(), invoke=invoke, sleep=lambda _: None)
    result.catalog = {name: {'architecture': {'input_modalities': ['text', 'image']}, 'supported_parameters': ['response_format', 'structured_outputs']} for name in result.settings.models}
    result.checked_at = time.monotonic()
    return result


class RoutingTests(unittest.TestCase):
    def test_primary_remains_first_and_succeeds_without_fallback(self):
        calls = []
        def invoke(model, doc):
            calls.append(model)
            return {'parsed': payload()}
        invoice, model = router(invoke).extract(Document('factura', []), Mock())
        self.assertEqual(calls, [PRIMARY_MODEL])
        self.assertEqual(model, PRIMARY_MODEL)
        self.assertEqual(invoice.importe_total, Decimal('121'))

    def test_fallback_walks_order_with_bounded_retries(self):
        calls, audit = [], Mock()
        def invoke(model, doc):
            calls.append(model)
            if model == PRIMARY_MODEL:
                raise provider_error(429)
            if model == DEFAULT_FALLBACKS[0]:
                raise provider_error(503)
            return {'parsed': payload()}
        _, selected = router(invoke).extract(Document('factura', []), audit)
        self.assertEqual(selected, DEFAULT_FALLBACKS[1])
        self.assertEqual(calls, [PRIMARY_MODEL]*2 + [DEFAULT_FALLBACKS[0]]*2 + [DEFAULT_FALLBACKS[1]])
        self.assertEqual(audit.call_count, 5)

    def test_all_models_exhausted_are_recoverable(self):
        invoke = Mock(side_effect=provider_error(429))
        with self.assertRaises(ProcessingError) as failure:
            router(invoke).extract(Document('', []), Mock())
        self.assertEqual(failure.exception.failure.category, 'modelos_agotados')
        self.assertTrue(failure.exception.failure.retry)
        self.assertEqual(invoke.call_count, 8)

    def test_auth_credit_and_config_do_not_cycle_models(self):
        for status in [400, 401, 402, 403, 404, 422]:
            with self.subTest(status=status):
                invoke = Mock(side_effect=provider_error(status))
                with self.assertRaises(ProcessingError) as failure:
                    router(invoke).extract(Document('', []), Mock())
                self.assertTrue(failure.exception.failure.pause)
                self.assertEqual(invoke.call_count, 1)

    def test_context_is_not_quota(self):
        failure = classify_error(provider_error(400, 'maximum context length exceeded'))
        self.assertEqual(failure.category, 'contexto')
        self.assertFalse(failure.fallback)
        self.assertFalse(failure.pause)

    def test_provider_overload_and_transport_errors_are_recoverable(self):
        self.assertTrue(classify_error(provider_error(529)).fallback)
        self.assertTrue(classify_error(httpx.ReadTimeout('test')).fallback)
        self.assertTrue(classify_error(httpx.RemoteProtocolError('test')).fallback)

    def test_embedded_http_200_error_and_adapter_error(self):
        error = provider_error(200)
        error.body = '{"error":{"code":429,"message":"rate limit"}}'
        self.assertTrue(classify_error(error).fallback)
        self.assertTrue(classify_error(ValueError('OpenRouter API returned an error: quota (code: 429)')).fallback)

    def test_invalid_json_and_amounts_stop_for_review(self):
        for result in [{'parsed': None, 'parsing_error': ValueError('invalid')}, {'parsed': payload(importe_total='not money')}]:
            invoke = Mock(return_value=result)
            with self.assertRaises(ProcessingError) as failure:
                router(invoke).extract(Document('', []), Mock())
            self.assertEqual(failure.exception.failure.category, 'respuesta_invalida')
            self.assertEqual(invoke.call_count, 1)

    def test_output_truncation_is_distinct(self):
        invoke = Mock(return_value={'parsed': payload(), 'raw': SimpleNamespace(response_metadata={'finish_reason': 'length'})})
        with self.assertRaises(ProcessingError) as failure:
            router(invoke).extract(Document('', []), Mock())
        self.assertEqual(failure.exception.failure.category, 'salida_truncada')

    def test_catalog_rejects_unknown_or_incompatible_models(self):
        invoke = Mock(return_value={'parsed': payload()})
        r = router(invoke)
        del r.catalog[PRIMARY_MODEL]
        r.catalog[DEFAULT_FALLBACKS[0]]['architecture']['input_modalities'] = ['text']
        _, model = r.extract(Document('', []), Mock())
        self.assertEqual(model, DEFAULT_FALLBACKS[1])

    def test_catalog_failure_sends_no_document(self):
        invoke = Mock()
        r = ModelRouter(settings(), client=Mock(get=Mock(side_effect=httpx.ConnectError('unavailable'))), invoke=invoke)
        with self.assertRaises(ProcessingError):
            r.extract(Document('', []), Mock())
        invoke.assert_not_called()

    def test_adapter_builds_real_schema_timeout_and_no_sdk_retry(self):
        # Real installed SDK + LangChain; replace only the final runnable invocation.
        from openrouter import OpenRouter
        with patch('openrouter.OpenRouter', wraps=OpenRouter) as sdk, patch('langchain_openrouter.ChatOpenRouter.with_structured_output') as structured:
            structured.return_value.invoke.return_value = {'parsed': payload()}
            result = ModelRouter(settings())._invoke_langchain(PRIMARY_MODEL, Document('texto', []))
            self.assertEqual(result['parsed']['numero_factura'], 'FAC-001')
            messages = structured.return_value.invoke.call_args.args[0]
            self.assertIn('datos, no instrucciones', messages[1].content[0]['text'])
            self.assertIsNone(sdk.call_args.kwargs['retry_config'])
            self.assertEqual(sdk.call_args.kwargs['timeout_ms'], 90000)


class ValidationTests(unittest.TestCase):
    def test_missing_data_stays_null_and_is_flagged(self):
        invoice = Invoice.model_validate(payload(fecha_emision=None, moneda=None))
        self.assertIsNone(invoice.moneda)
        self.assertEqual(len(invoice.warnings()), 2)

    def test_totals_and_withholding(self):
        self.assertEqual(Invoice.model_validate(payload()).warnings(), [])
        self.assertTrue(Invoice.model_validate(payload(importe_total=150)).warnings())
        self.assertEqual(Invoice.model_validate(payload(impuestos=[dict(nombre='IRPF', porcentaje=15, importe=-15)], importe_total=85)).warnings(), [])

    def test_credit_invoice_and_invalid_numbers(self):
        credit = payload(base_imponible=-100, impuestos=[dict(nombre='IVA', porcentaje=21, importe=-21)], importe_total=-121)
        self.assertEqual(Invoice.model_validate(credit).warnings(), [])
        for value in ['NaN', 'Infinity', '1.001']:
            with self.assertRaises(ValidationError):
                Invoice.model_validate(payload(importe_total=value))

    def test_bad_dates_currency_and_unknown_fields(self):
        for change in [dict(fecha_emision='2026-02-30'), dict(moneda='euros'), dict(password='forbidden')]:
            with self.assertRaises(ValidationError):
                Invoice.model_validate(payload(**change))


def pdf_bytes():
    text = b'Factura FAC-001 proveedor ficticio Base 100 IVA 21 Total 121 EUR Fecha 2026-10-23'
    stream = b'BT /F1 12 Tf 30 700 Td (' + text + b') Tj ET'
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
    result, offsets = b'%PDF-1.4\n', [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(result)); result += str(index).encode()+b' 0 obj\n'+obj+b'\nendobj\n'
    xref = len(result)
    result += b'xref\n0 6\n0000000000 65535 f \n' + b''.join(f'{offset:010} 00000 n \n'.encode() for offset in offsets[1:])
    return result+b'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+str(xref).encode()+b'\n%%EOF'


class DocumentTests(unittest.TestCase):
    def test_digital_pdf_extraction_without_ocr(self):
        with patch('pytesseract.image_to_string') as ocr:
            result = extract_document(pdf_bytes(), '.pdf', settings())
            self.assertIn('FAC-001', result.text)
            self.assertEqual(result.images, [])
            ocr.assert_not_called()

    def test_image_ocr_and_vision(self):
        from PIL import Image
        image = BytesIO(); Image.new('RGB', (200, 200), 'white').save(image, 'PNG')
        with patch('pytesseract.image_to_string', return_value='Factura por OCR'):
            result = extract_document(image.getvalue(), '.png', settings())
        self.assertEqual(result.text, 'Factura por OCR')
        self.assertTrue(result.images[0].startswith('data:image/jpeg;base64,'))

    def test_missing_ocr_is_configuration_error(self):
        import pytesseract
        from PIL import Image
        image = BytesIO(); Image.new('RGB', (20, 20), 'white').save(image, 'PNG')
        with patch('pytesseract.image_to_string', side_effect=pytesseract.TesseractNotFoundError()):
            with self.assertRaises(ConfigurationError):
                extract_document(image.getvalue(), '.png', settings())

    def test_corrupt_pdf_and_no_silent_truncation(self):
        with self.assertRaises(DocumentError):
            extract_document(b'not a pdf', '.pdf', settings())
        with self.assertRaises(DocumentError):
            extract_document(pdf_bytes(), '.pdf', replace(settings(), max_chars=10))

    def test_hash_snapshot_and_original_kept(self):
        with tempfile.TemporaryDirectory() as folder:
            file = Path(folder)/'FAC-001.pdf'; file.write_bytes(pdf_bytes())
            data, sha = read_snapshot(file, settings(Path(folder)))
            self.assertEqual(len(sha), 64)
            self.assertEqual(file.read_bytes(), data)


class OriginalStorageTests(unittest.TestCase):
    def test_original_upload_and_duplicate_recovery_confirm_the_lease(self):
        for status, body in [(200, {}), (400, {'error':'Duplicate'}), (409, {'code':'ResourceAlreadyExists'})]:
            with self.subTest(status=status):
                requests = []
                def handle(request):
                    requests.append(request)
                    return httpx.Response(status, json=body) if request.method == 'POST' else httpx.Response(200, json=[{'id':'doc'}])
                with httpx.Client(base_url='https://example.invalid/rest/v1/', transport=httpx.MockTransport(handle)) as client:
                    Store(settings(), client=client).store_original('doc','token',b'original','.pdf','a'*64)
                self.assertEqual([r.method for r in requests], ['POST','PATCH'])
                self.assertIn('bloqueo_token=eq.token',str(requests[1].url))
                self.assertEqual(requests[0].headers['x-upsert'],'false')

    def test_other_upload_errors_do_not_confirm_the_original(self):
        requests = []
        def handle(request):
            requests.append(request)
            return httpx.Response(400,json={'error':'InvalidMimeType'})
        with httpx.Client(base_url='https://example.invalid/rest/v1/',transport=httpx.MockTransport(handle)) as client:
            with self.assertRaises(StorageError):
                Store(settings(),client=client).store_original('doc','token',b'original','.pdf','a'*64)
        self.assertEqual(len(requests),1)

    def test_original_is_not_confirmed_when_lease_changes(self):
        def handle(request):
            return httpx.Response(200,json={} if request.method == 'POST' else [])
        with httpx.Client(base_url='https://example.invalid/rest/v1/',transport=httpx.MockTransport(handle)) as client:
            with self.assertRaises(StorageError):
                Store(settings(),client=client).store_original('doc','old-token',b'original','.pdf','a'*64)


class WorkerTests(unittest.TestCase):
    def test_storage_confirmation_failure_keeps_original_and_lease(self):
        with tempfile.TemporaryDirectory() as folder:
            file = Path(folder)/'FAC-001.pdf'; file.write_bytes(pdf_bytes())
            store = Mock(); store.claim.return_value = {'id':'test-document'}
            store.save.side_effect = StorageError('save not confirmed')
            worker = Worker(settings(Path(folder)), store=store, router=router(lambda *_: {'parsed': payload()}), sleep=lambda _: None)
            with self.assertRaises(StorageError):
                worker.run_file(file)
            self.assertTrue(file.exists())
            store.fail.assert_not_called()

    def test_bad_document_does_not_prevent_following_file(self):
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder)/'a.pdf').write_bytes(b'%PDF-broken')
            (Path(folder)/'b.pdf').write_bytes(pdf_bytes())
            store = Mock(); store.claim.return_value={'id':'doc'}; store.save.return_value={'estado':'completada'}
            worker = Worker(settings(Path(folder)), store=store, router=router(lambda *_: {'parsed': payload()}), sleep=lambda _: None)
            worker.cycle()
            self.assertEqual(store.fail.call_count, 1)
            self.assertEqual(store.save.call_count, 1)

    def test_already_claimed_or_completed_document_not_sent_again(self):
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'a.pdf';file.write_bytes(pdf_bytes())
            store=Mock();store.claim.return_value=None
            llm=Mock();Worker(settings(Path(folder)),store=store,router=llm).run_file(file)
            llm.extract.assert_not_called()


if __name__ == '__main__':
    unittest.main()
