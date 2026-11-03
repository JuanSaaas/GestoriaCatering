'use client';

import type { ReactNode } from 'react';
import { btnGhost } from './ui';

export function SalesFilters({items,value,onChange}:{items:{value:string;label:string;count?:number}[];value:string;onChange:(value:string)=>void}) {
 return <div role="group" aria-label="Filtrar listado" className="flex flex-wrap gap-2 border-b border-neutral-300 pb-3">{items.map(item=><button key={item.value} type="button" aria-pressed={value===item.value} onClick={()=>onChange(item.value)} className={`inline-flex min-h-12 items-center gap-2 border-b-2 px-4 py-2 ${value===item.value?'!border-neutral-900 bg-neutral-100 font-semibold text-neutral-950':'!border-transparent text-neutral-600 hover:!border-neutral-500'}`}>{item.label}{item.count!==undefined&&<span className="rounded bg-neutral-100 px-2 text-neutral-700">{item.count}</span>}</button>)}</div>;
}
export function SalesTable({caption,headers,children}:{caption:string;headers:string[];children:ReactNode}) {
 return <div role="region" tabIndex={0} aria-label={caption} className="overflow-x-auto rounded-lg border border-neutral-300 bg-white"><table className="w-full min-w-[56rem] text-left"><caption className="sr-only">{caption}</caption><thead className="bg-neutral-50 text-neutral-600"><tr>{headers.map((h,i)=><th key={`${h}-${i}`} scope="col" className={`border-b border-neutral-300 px-4 py-4 font-medium ${h.includes('Total')||h.includes('Precio')?'text-right':''}`}>{h}</th>)}</tr></thead><tbody className="divide-y divide-neutral-200">{children}</tbody></table></div>;
}
export function salesCSV(filename:string,rows:unknown[][]) {
 const safe=(value:unknown)=>{const s=String(value??'');return '"'+(/^[\s]*[=+@-]/.test(s)?"'":'')+s.replace(/"/g,'""')+'"';};
 const blob=new Blob(['\ufeff'+rows.map(row=>row.map(safe).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function SalesEmpty({children,onCreate,label}:{children:ReactNode;onCreate?:()=>void;label?:string}) {
 return <div className="rounded-lg border border-dashed border-neutral-400 bg-white p-8 text-center"><p className="text-neutral-700">{children}</p>{onCreate&&<button type="button" onClick={onCreate} className={`${btnGhost} mt-4`}>{label||'Crear registro'}</button>}</div>;
}
