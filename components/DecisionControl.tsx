'use client';

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { btnGhost } from './ui';

export default function DecisionControl({ decision, label, onClick, disabled = false, ariaLabel }: {
  decision: 'accept' | 'reject'; label?: string; onClick?: () => void; disabled?: boolean; ariaLabel?: string;
}) {
  const accepted = decision === 'accept';
  const Icon = accepted ? CheckIcon : XMarkIcon;
  const text = label || (accepted ? 'Aceptar' : 'Rechazar');
  const className = `${btnGhost} !border-2 !bg-white !bg-none !shadow-none !text-base !font-medium disabled:!opacity-100 ${accepted ? '!border-green-700 !text-green-700' : '!border-red-700 !text-red-700'}`;
  const content = <><Icon aria-hidden="true" className="shrink-0" style={{ width: 24, height: 24 }} strokeWidth={2} />{text}</>;
  return onClick ? <button type="button" className={className} disabled={disabled} aria-label={ariaLabel} onClick={onClick}>{content}</button>
    : <span className={className}>{content}</span>;
}
