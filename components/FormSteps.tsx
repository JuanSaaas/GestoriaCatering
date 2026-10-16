'use client';

import { useRef, useState, type ReactNode } from 'react';
import { btnGhost, btnPrimary } from './ui';

export default function FormSteps({ steps, disabled = false, submitLabel, busyLabel = 'Guardando…' }: {
  steps: { title: string; content: ReactNode }[]; disabled?: boolean; submitLabel: string; busyLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  function move(next: number) {
    if (disabled || next < 0 || next >= steps.length) return;
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
    setStep(next);
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('fieldset:not([hidden]) legend')?.focus());
  }
  return <div ref={ref} className="space-y-6" onInvalidCapture={(event) => {
    const fieldset = (event.target as HTMLElement).closest('fieldset[data-step]');
    if (fieldset) {
      setStep(Number((fieldset as HTMLElement).dataset.step));
      requestAnimationFrame(() => (event.target as HTMLElement).focus());
    }
  }} onKeyDown={(event) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement && step < steps.length - 1) { event.preventDefault(); move(step + 1); }
  }}>
    <div role="status" className="text-sm font-medium text-neutral-700">Paso {step + 1} de {steps.length} · {steps[step].title}</div>
    <ol aria-label="Progreso del formulario" className="flex gap-2">
      {steps.map((item, index) => <li key={item.title} aria-current={step === index ? 'step' : undefined} className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-[var(--crm-accent)]' : 'bg-neutral-200'}`}><span className="sr-only">{item.title}{index < step ? ', completado' : ''}</span></li>)}
    </ol>
    <p className="text-sm text-neutral-600">Los campos con * son obligatorios.</p>
    {steps.map((item, index) => <fieldset key={item.title} data-step={index} hidden={step !== index} disabled={disabled} className="min-w-0 space-y-6">
      <legend tabIndex={-1} className="text-base font-semibold mb-4">{item.title}</legend>{item.content}
    </fieldset>)}
    <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-4">
      {step > 0 && <button type="button" disabled={disabled} className={btnGhost} onClick={() => move(step - 1)}>Anterior</button>}
      {step < steps.length - 1 ? <button key="continue" type="button" disabled={disabled} className={btnPrimary} onClick={() => move(step + 1)}>Continuar</button> : <button key="submit" type="submit" disabled={disabled} className={btnPrimary}>{disabled ? busyLabel : submitLabel}</button>}
    </div>
  </div>;
}
