'use client';

import { useId, useRef, useState, type FormHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type Issue = { control: Control; message: string; id: string };

function fieldName(control: Control) {
  const label = control.labels?.[0]?.cloneNode(true) as HTMLElement | undefined;
  label?.querySelectorAll('.field-error, input, select, textarea').forEach((node) => node.remove());
  return (label?.textContent || control.getAttribute('aria-label') || control.name || 'este campo').replace(/\s*\*\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function message(control: Control) {
  if (control.validity.valueMissing || (control.required && !control.value.trim())) return `Completa «${fieldName(control)}» para continuar.`;
  if (control.validity.typeMismatch) return control.type === 'email' ? 'Escribe un correo válido, por ejemplo nombre@empresa.es.' : 'Revisa el formato de este campo.';
  if (control.validity.rangeUnderflow) return `Introduce un valor igual o mayor que ${control.getAttribute('min')}.`;
  if (control.validity.rangeOverflow) return `Introduce un valor igual o menor que ${control.getAttribute('max')}.`;
  if (control.validity.stepMismatch) return `Usa incrementos de ${control.getAttribute('step') || '1'}.`;
  return control.validity.valid ? '' : 'Revisa el valor introducido y vuelve a intentarlo.';
}

/** Inline feedback shared by public and internal forms; keeps native constraints. */
export default function ValidatedForm({ onSubmit, children, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  const prefix = useId();
  const counter = useRef(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const visibleIssues = issues.filter((issue) => issue.control.isConnected).sort((a, b) =>
    a.control.compareDocumentPosition(b.control) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

  function validate(control: Control) {
    if (!control.willValidate) return true;
    control.setCustomValidity('');
    const text = message(control);
    const id = control.dataset.errorId || `${prefix}-error-${counter.current++}`;
    control.dataset.errorId = id;
    if (!control.id) control.id = `${id}-control`;
    control.setAttribute('aria-invalid', String(!!text));
    const descriptions = (control.getAttribute('aria-describedby') || '').split(' ').filter((value) => value && value !== id);
    if (text) descriptions.push(id);
    if (descriptions.length) control.setAttribute('aria-describedby', descriptions.join(' '));
    else control.removeAttribute('aria-describedby');
    setIssues((previous) => [...previous.filter((issue) => issue.control !== control), ...(text ? [{ control, message: text, id }] : [])]);
    return !text;
  }

  return <form {...props} noValidate onInvalidCapture={(event) => {
    event.preventDefault();
    validate(event.target as Control);
  }} onReset={(event) => {
    Array.from(event.currentTarget.elements).forEach((control) => {
      if (control instanceof HTMLElement) { control.removeAttribute('aria-invalid'); if (control.dataset.errorId) {
        const descriptions = (control.getAttribute('aria-describedby') || '').split(' ').filter((id) => id !== control.dataset.errorId).join(' ');
        if (descriptions) control.setAttribute('aria-describedby', descriptions); else control.removeAttribute('aria-describedby');
      } }
    });
    setIssues([]);
    setSubmitted(false);
  }} onBlurCapture={(event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) validate(event.target);
  }} onInputCapture={(event) => {
    const control = event.target;
    if ((control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) && control.hasAttribute('aria-invalid')) validate(control);
  }} onSubmit={(event) => {
    const controls = Array.from(event.currentTarget.elements).filter((control): control is Control => control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement);
    const invalid = controls.filter((control) => !validate(control));
    if (invalid.length) {
      setSubmitted(true);
      event.preventDefault();
      invalid[0].dispatchEvent(new Event('invalid', { bubbles: false, cancelable: true }));
      requestAnimationFrame(() => invalid[0].focus());
      return;
    }
    setSubmitted(false);
    onSubmit?.(event);
  }}>
    <p className="text-base text-neutral-600 mb-4">Los campos con * son obligatorios.</p>
    {submitted && visibleIssues.length > 0 && <div role="alert" className="error-summary">
      <p className="font-semibold">⚠ Revisa los campos indicados. Tus respuestas se conservan.</p>
      <ul>{visibleIssues.map((issue) => <li key={issue.id}><a href={`#${issue.control.id}`} onClick={(event) => {
        event.preventDefault();
        issue.control.dispatchEvent(new Event('invalid', { cancelable: true }));
        requestAnimationFrame(() => issue.control.focus());
      }}>{fieldName(issue.control)}: {issue.message}</a></li>)}</ul>
    </div>}
    {children}
    {issues.filter((issue) => issue.control.isConnected && issue.control.parentElement).map((issue) => createPortal(
      <p id={issue.id} role={submitted ? undefined : 'status'} className="field-error">⚠ {issue.message}</p>, issue.control.parentElement!, issue.id,
    ))}
  </form>;
}
