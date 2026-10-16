'use client';

import { Children, isValidElement, useId, useState, type SelectHTMLAttributes } from 'react';
import { inputCls, labelCls } from './ui';

export default function SearchableSelect({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const [query, setQuery] = useState('');
  const searchId = useId();
  const options = Children.toArray(children);
  const searchable = options.filter((option) => isValidElement<{ value?: string }>(option) && option.props.value && option.props.value !== '__new__').length > 10;
  const visible = options.filter((option) => {
    if (!searchable || !query || !isValidElement<{ value?: string; children?: React.ReactNode }>(option)) return true;
    const value = option.props.value;
    return !value || value === '__new__' || value === props.value || Children.toArray(option.props.children).join('').toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'));
  });
  return <div className="min-w-0 flex-1">
    {searchable && <div className="mb-2"><label htmlFor={searchId} className={labelCls}>Buscar en las opciones</label><input id={searchId} type="search" className={inputCls} placeholder="Escribe un nombre…" value={query} onChange={(event) => setQuery(event.target.value)} /><p role="status" className="text-xs text-neutral-600 mt-2">{visible.filter((option) => isValidElement<{ value?: string }>(option) && option.props.value && option.props.value !== '__new__').length} opciones disponibles</p></div>}
    <select {...props}>{visible}</select>
  </div>;
}
