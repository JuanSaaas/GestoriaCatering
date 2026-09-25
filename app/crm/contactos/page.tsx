'use client';
<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente } from '@/lib/types';
import CrmShell from '@/components/CrmShell';
import { Icon, inputCls } from '@/components/ui';

export default function ContactosPage(){
 const [items,setItems]=useState<Cliente[]>([]); const [q,setQ]=useState(''); const [live,setLive]=useState(false);
 async function load(){const {data}=await supabase.from('clientes').select('*, empresa_rel:empresas(*)').order('created_at',{ascending:false}); setItems((data as Cliente[])||[])}
 useEffect(()=>{load(); const c=supabase.channel('crm-clientes').on('postgres_changes',{event:'*',schema:'public',table:'clientes'},load).subscribe(s=>s==='SUBSCRIBED'&&setLive(true)); return()=>{supabase.removeChannel(c)}},[]);
 const shown=useMemo(()=>items.filter(x=>!q||`${x.nombre} ${x.email} ${x.telefono||''} ${x.empresa||''}`.toLowerCase().includes(q.toLowerCase())),[items,q]);
 return <CrmShell live={live}><div className="p-6 lg:p-8 max-w-7xl"><div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7"><div><div className="text-xs uppercase tracking-[.18em] text-neutral-400 font-semibold">Base de datos</div><h1 className="text-3xl font-semibold tracking-tight mt-1">Contactos</h1><p className="text-sm text-neutral-500 mt-1">{items.length} contactos sincronizados desde Supabase.</p></div><div className="relative w-full md:w-80"><Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/><input className={`${inputCls} pl-9`} value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar contacto…"/></div></div>
 <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm"><div className="hidden md:grid grid-cols-[1.4fr_1.4fr_1fr_1fr_.7fr] gap-4 px-5 py-3 bg-neutral-50 border-b text-[10px] uppercase tracking-wider font-semibold text-neutral-400"><span>Contacto</span><span>Email</span><span>Teléfono</span><span>Empresa</span><span>Tipo</span></div>{shown.map(x=><div key={x.id} className="grid md:grid-cols-[1.4fr_1.4fr_1fr_1fr_.7fr] gap-2 md:gap-4 px-5 py-4 border-b last:border-0 border-neutral-100 items-center hover:bg-neutral-50/70 transition"><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold">{x.nombre.split(' ').map(v=>v[0]).slice(0,2).join('').toUpperCase()}</span><div><div className="font-medium text-sm">{x.nombre}</div><div className="text-xs text-neutral-400 md:hidden">{x.email}</div></div></div><div className="hidden md:block text-sm text-neutral-600 truncate">{x.email}</div><div className="text-sm text-neutral-500">{x.telefono||'—'}</div><div className="text-sm text-neutral-500">{x.empresa_rel?.nombre||x.empresa||'—'}</div><div><span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium capitalize">{x.tipo_cliente}</span></div></div>)}{shown.length===0&&<div className="py-16 text-center text-sm text-neutral-400">No hay contactos que coincidan.</div>}</div></div></CrmShell>
=======

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { OPORTUNIDAD_SELECT } from '@/lib/types';
import CrmShell from '@/components/CrmShell';
import CompanyLogo from '@/components/CompanyLogo';
import { Avatar, Icon, btnGhost, inputCls } from '@/components/ui';

type Contacto = Cliente & { empresa_rel?: Empresa | null };

export default function ContactosPage() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [query, setQuery] = useState('');

  async function load() {
    const [c, e, o] = await Promise.all([
      supabase.from('clientes').select('*').order('created_at', { ascending: false }),
      supabase.from('empresas').select('*').order('nombre'),
      supabase.from('oportunidades').select(OPORTUNIDAD_SELECT),
    ]);
    setContactos((c.data as Contacto[]) || []);
    setEmpresas((e.data as Empresa[]) || []);
    setOps((o.data as unknown as Oportunidad[]) || []);
  }

  useEffect(() => {
    load();
  }, []);

  const empresaById = useMemo(() => Object.fromEntries(empresas.map((e) => [e.id, e])), [empresas]);

  // Agrupa los contactos por empresa (igual que la vista de referencia): cada
  // tarjeta es una empresa, con su contacto principal y cuántas personas más hay.
  const grupos = useMemo(() => {
    const porEmpresa = new Map<string, Contacto[]>();
    const sinEmpresa: Contacto[] = [];
    for (const c of contactos) {
      const emp = (c.empresa_id && empresaById[c.empresa_id]) || null;
      if (emp) {
        const arr = porEmpresa.get(emp.id) || [];
        arr.push(c);
        porEmpresa.set(emp.id, arr);
      } else {
        sinEmpresa.push(c);
      }
    }
    const gruposEmpresa = [...porEmpresa.entries()].map(([empId, personas]) => ({
      empresa: empresaById[empId],
      personas,
    }));
    return { gruposEmpresa, sinEmpresa };
  }, [contactos, empresaById]);

  const q = query.trim().toLowerCase();
  const filtrarPersonas = (personas: Contacto[]) =>
    !q ? personas : personas.filter((p) => `${p.nombre} ${p.email} ${p.cargo || ''}`.toLowerCase().includes(q));

  const gruposFiltrados = grupos.gruposEmpresa
    .map((g) => ({ ...g, personas: filtrarPersonas(g.personas) }))
    .filter((g) => !q || g.empresa.nombre.toLowerCase().includes(q) || g.personas.length > 0);
  const sinEmpresaFiltrados = filtrarPersonas(grupos.sinEmpresa);

  function exportarCSV() {
    const filas = [
      ['Nombre', 'Email', 'Teléfono', 'Cargo', 'Empresa', 'Oportunidades'],
      ...contactos.map((c) => {
        const emp = (c.empresa_id && empresaById[c.empresa_id]) || null;
        return [
          c.nombre,
          c.email,
          c.telefono || '',
          c.cargo || '',
          emp?.nombre || c.empresa || '',
          String(ops.filter((o) => o.cliente_id === c.id).length),
        ];
      }),
    ];
    const csv = filas.map((f) => f.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contactos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalMostrado = gruposFiltrados.reduce((s, g) => s + g.personas.length, 0) + sinEmpresaFiltrados.length;

  return (
    <CrmShell>
      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Contactos</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {totalMostrado} persona{totalMostrado === 1 ? '' : 's'} en {gruposFiltrados.length} empresa
              {gruposFiltrados.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className={btnGhost} onClick={exportarCSV} type="button">
              <Icon name="download" className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>

        <div className="relative mb-5 max-w-sm">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Buscar empresa o persona…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {gruposFiltrados.map(({ empresa, personas }) => {
            const principal = personas[0];
            if (!principal) return null;
            return (
              <Link
                key={empresa.id}
                href={`/crm/empresas/${empresa.id}`}
                className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[var(--crm-accent)] hover:shadow-card-hover transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyLogo
                    nombre={empresa.nombre}
                    sitio_web={empresa.sitio_web}
                    email={empresa.email}
                    logo_url={empresa.logo_url}
                    size={40}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{empresa.nombre}</div>
                    <div className="text-xs text-neutral-500 truncate">
                      {[empresa.sector, empresa.ciudad].filter(Boolean).join(' · ') || 'Sin clasificar'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-500">Contacto principal</div>
                    <div className="text-sm font-medium truncate">{principal.nombre}</div>
                  </div>
                  <span className="text-xs font-medium text-neutral-500 whitespace-nowrap bg-neutral-100 rounded-full px-2 py-1">
                    {personas.length} persona{personas.length === 1 ? '' : 's'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {sinEmpresaFiltrados.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mt-8 mb-3">Sin empresa</h2>
            <div className="space-y-2">
              {sinEmpresaFiltrados.map((c) => (
                <Link
                  key={c.id}
                  href={`/crm/contactos/${c.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[var(--crm-accent)] transition"
                >
                  <Avatar nombre={c.nombre} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{c.nombre}</div>
                    <div className="text-xs text-neutral-500 truncate">{c.email}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {totalMostrado === 0 && (
          <div className="text-sm text-neutral-500 py-10 text-center border border-dashed border-neutral-200 rounded-xl">
            Nadie ha contactado todavía.
          </div>
        )}
      </div>
    </CrmShell>
  );
>>>>>>> 1a82e92 (Actualización)
}
