'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { btnGhost, btnPrimary, fmtDate, fmtMoney } from './ui';

export default function FormSteps({ steps, disabled = false, submitLabel, busyLabel = 'Guardando…' }: {
  steps: { title: string; content: ReactNode }[]; disabled?: boolean; submitLabel: string; busyLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const [review, setReview] = useState<{ label: string; value: string }[]>([]);
  const reviewing = step === steps.length;
  const total = steps.length + 1;
  const ref = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    ref.current?.querySelector<HTMLElement>('[data-review-title], fieldset[data-step]:not([hidden]) > legend')?.focus();
  }, [step]);
  function move(next: number) {
    if (disabled || next < 0 || next > steps.length) return;
    if (next > step) {
      const controls = ref.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('fieldset:not([hidden]) input, fieldset:not([hidden]) select, fieldset:not([hidden]) textarea');
      const invalid = Array.from(controls || []).find((control) => {
        if (!control.willValidate) return false;
        control.setCustomValidity('');
        return !control.checkValidity() || (control.required && !control.value.trim());
      });
      if (invalid) {
        if (invalid.required && !invalid.value.trim()) invalid.setCustomValidity('Completa este campo para continuar.');
        invalid.reportValidity(); invalid.focus(); return;
      }
    }
    if (next === steps.length) {
      const controls = Array.from(ref.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('fieldset[data-step] input, fieldset[data-step] select, fieldset[data-step] textarea') || []);
      setReview(controls.filter((control) => {
        if (['hidden', 'password', 'search'].includes(control.type) || control.matches(':disabled')) return false;
        let parent = control.parentElement;
        while (parent && !parent.matches('fieldset[data-step]')) {
          if (parent.hidden) return false;
          parent = parent.parentElement;
        }
        return true;
      }).map((control) => ({
        label: control.labels?.[0]?.textContent?.trim() || control.getAttribute('aria-label') || control.name,
        value: control instanceof HTMLSelectElement ? (control.value ? Array.from(control.selectedOptions).map((option) => option.text).join(', ') : '') : control instanceof HTMLInputElement && control.type === 'checkbox' ? (control.checked ? 'Sí' : 'No') : control instanceof HTMLInputElement && control.type === 'file' ? Array.from(control.files || []).map((file) => file.name).join(', ') : control.type === 'date' && control.value ? fmtDate(control.value) : control.type === 'number' && control.value && control.labels?.[0]?.textContent?.includes('€') ? fmtMoney(Number(control.value)) : control.value,
      })).filter((item) => item.label));
    }
    setStep(next);
  }
  return <div ref={ref} className="space-y-6" onInvalidCapture={(event) => {
    const fieldset = (event.target as HTMLElement).closest('fieldset[data-step]');
    if (fieldset) {
      setStep(Number((fieldset as HTMLElement).dataset.step));
      requestAnimationFrame(() => (event.target as HTMLElement).focus());
    }
  }} onKeyDown={(event) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement && step < steps.length) { event.preventDefault(); move(step + 1); }
  }}>
    <div role="status" className="text-sm font-medium text-neutral-700">Paso {step + 1} de {total} · {reviewing ? 'Revisar respuestas' : steps[step].title}</div>
    <ol aria-label="Progreso del formulario" className="flex gap-2">
      {[...steps, { title: 'Revisar respuestas' }].map((item, index) => <li key={item.title} aria-current={step === index ? 'step' : undefined} className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-[var(--crm-accent)]' : 'bg-neutral-200'}`}><span className="sr-only">{item.title}{index < step ? ', completado' : ''}</span></li>)}
    </ol>
    {steps.map((item, index) => <fieldset key={item.title} data-step={index} hidden={step !== index} disabled={disabled} className="min-w-0 space-y-6">
      <legend tabIndex={-1} className="text-base font-semibold mb-4">{item.title}</legend>{item.content}
    </fieldset>)}
    {reviewing && <section><h3 data-review-title tabIndex={-1} className="font-semibold">Revisa tus respuestas antes de enviar</h3><p className="mt-2 mb-4">Puedes volver al paso anterior para corregirlas.</p><dl className="space-y-4">{review.map((item, index) => <div key={index}><dt className="font-medium">{item.label}</dt><dd className="break-words whitespace-pre-wrap">{item.value || 'Sin indicar'}</dd></div>)}</dl></section>}
    <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-4">
      {step > 0 && <button type="button" disabled={disabled} className={btnGhost} onClick={() => move(step - 1)}>Anterior</button>}
      {!reviewing ? <button key="continue" type="button" disabled={disabled} className={btnPrimary} onClick={() => move(step + 1)}>{step === steps.length - 1 ? 'Revisar respuestas' : 'Continuar'}</button> : <button key="submit" type="submit" disabled={disabled} className={btnPrimary}>{disabled ? busyLabel : submitLabel}</button>}
    </div>
  </div>;
}
