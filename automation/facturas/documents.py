import base64
from dataclasses import dataclass
import hashlib
from io import BytesIO
from pathlib import Path
import stat
import warnings

from .config import ConfigurationError, Settings


class DocumentError(Exception):
    pass


@dataclass
class Document:
    text: str
    images: list[str]


def read_snapshot(path: Path, settings: Settings) -> tuple[bytes, str]:
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or path.is_symlink():
        raise DocumentError("El archivo debe ser regular; no se admiten enlaces simbólicos.")
    if info.st_size > settings.max_mb * 1024 * 1024:
        raise DocumentError("El documento supera el tamaño configurado. Divide el documento antes de reintentarlo.")
    with path.open("rb") as stream:
        data = stream.read(settings.max_mb * 1024 * 1024 + 1)
    after = path.lstat()
    if (info.st_size, info.st_mtime_ns) != (after.st_size, after.st_mtime_ns) or len(data) != info.st_size:
        raise DocumentError("El documento todavía se está copiando. Se comprobará de nuevo.")
    if not data:
        raise DocumentError("El archivo está vacío.")
    return data, hashlib.sha256(data).hexdigest()


def extract_document(data: bytes, suffix: str, settings: Settings) -> Document:
    import pypdfium2 as pdfium
    from PIL import Image, ImageOps
    import pytesseract
    if settings.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
    texts, images = [], []

    def scan(image):
        if image.width * image.height > 25_000_000:
            raise DocumentError("La imagen tiene demasiados píxeles. Reduce su resolución.")
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail((1800, 1800))
        try:
            text = pytesseract.image_to_string(image, lang=settings.ocr_language, timeout=30)
        except (pytesseract.TesseractNotFoundError, pytesseract.TesseractError) as exc:
            raise ConfigurationError("Instala Tesseract y sus idiomas OCR; revisa TESSERACT_CMD y FACTURAS_OCR_LANGUAGE.") from exc
        except RuntimeError as exc:
            raise DocumentError("El OCR ha agotado su tiempo. Reduce la resolución del documento.") from exc
        output = BytesIO()
        image.save(output, format="JPEG", quality=85)
        images.append("data:image/jpeg;base64," + base64.b64encode(output.getvalue()).decode("ascii"))
        return text

    try:
        if suffix == ".pdf":
            if not data.startswith(b"%PDF-"):
                raise DocumentError("El archivo no contiene un PDF válido.")
            with pdfium.PdfDocument(data) as pdf:
                if not 1 <= len(pdf) <= settings.max_pages:
                    raise DocumentError("El PDF supera el número de páginas configurado. Divide las facturas en archivos separados.")
                for index in range(len(pdf)):
                    page = pdf[index]
                    try:
                        textpage = page.get_textpage()
                        try:
                            text = textpage.get_text_bounded()
                        finally:
                            textpage.close()
                        if len(text.strip()) < 60:
                            width, height = page.get_size()
                            scale = min(2.0, 1800 / max(width, height))
                            bitmap = page.render(scale=scale)
                            try:
                                text = scan(bitmap.to_pil())
                            finally:
                                bitmap.close()
                        texts.append(f"Página {index + 1}:\n{text}")
                    finally:
                        page.close()
        else:
            with warnings.catch_warnings():
                warnings.simplefilter("error", Image.DecompressionBombWarning)
                with Image.open(BytesIO(data)) as image:
                    if image.format not in {"PNG", "JPEG", "WEBP"}:
                        raise DocumentError("La imagen debe ser PNG, JPEG o WebP.")
                    texts.append(scan(image))
    except (ConfigurationError, DocumentError):
        raise
    except Exception as exc:
        raise DocumentError("No se pudo leer el documento. Comprueba que no está dañado ni protegido con contraseña.") from exc
    text = "\n\n".join(texts)
    if len(text) > settings.max_chars:
        raise DocumentError("El texto supera el límite configurado. Divide el documento; no se ha truncado su contenido.")
    if not text.strip() and not images:
        raise DocumentError("No se encontró contenido legible.")
    return Document(text=text, images=images)
