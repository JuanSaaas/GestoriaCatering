'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { OPORTUNIDAD_SELECT } from '@/lib/types';
import CrmShell from '@/components/CrmShell';
import CompanyLogo from '@/components/CompanyLogo';
import { Icon, btnPrimary, inputCls } from '@/components/ui';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [contactos, setContactos] = useState<Cliente[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const [sitio, setSitio] = useState('');

  async function load() {
    const [e, o, c] = await Promise.all([
      supabase.from('empresas').select('*').order('nombre'),
      supabase.from('oportunidades').select(OPORTUNIDAD_SELECT),
      supabase.from('clientes').select('*'),
    ]);
    setEmpresas((e.data as Empresa[]) || []);
    setOportunidades((o.data as unknown as Oportunidad[]) || []);
    setContactos((c.data as Cliente[]) || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function crear(ev: React.FormEvent) {
    ev.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('empresas').insert({
      nombre: nombre.trim(),
      sitio_web: sitio.trim() || null,
    });
    setSaving(false);
    if (error) {
      alert(error.code === '23505' ? 'Ya existe una empresa con ese nombre.' : 'No se pudo crear la empresa.');
      return;
    }
    setNombre('');
    setSitio('');
    load();
  }

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return empresas.filter((e) => !q || `${e.nombre} ${e.ciudad || ''} ${e.sector || ''}`.toLowerCase().includes(q));
  }, [empresas, query]);

  return (
    <CrmShell>
      <div className="px-6 py-6 max-w-5xl">
        <h1 className="text-2xl font-semibold">Empresas que nos han contactado</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Al escribir el nombre aparece el logo estimado. Añade la web para afinarlo.
        </p>

        <form onSubmit={crear} className="flex flex-col sm:flex-row gap-2 mb-8 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-neutral-500 mb-1.5 block">Nueva empresa</label>
            <div className="flex items-center gap-2">
              {nombre.trim() ? <CompanyLogo nombre={nombre} sitio_web={sitio} size={36} /> : null}
              <input className={inputCls} placeholder="Nombre de la empresa" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs text-neutral-500 mb-1.5 block">Web (opcional)</label>
            <input className={inputCls} placeholder="empresa.com" value={sitio} onChange={(e) => setSitio(e.target.value)} />
          </div>
          <button className={btnPrimary} disabled={saving || !nombre.trim()}>
            {saving ? 'Guardando…' : 'Añadir'}
          </button>
        </form>

        <div className="relative mb-5 max-w-sm">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input className={`${inputCls} pl-9`} placeholder="Buscar empresa…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {filtradas.map((emp) => {
            const ops = oportunidades.filter((o) => o.empresa_id === emp.id);
            const people = contactos.filter((c) => c.empresa_id === emp.id);
            return (
              <Link
                key={emp.id}
                href={`/crm/empresas/${emp.id}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:border-black transition"
              >
                <CompanyLogo
                  nombre={emp.nombre}
                  sitio_web={emp.sitio_web}
                  email={emp.email}
                  logo_url={emp.logo_url}
                  size={44}
                />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{emp.nombre}</div>
                  <div className="text-xs text-neutral-500">
                    {people.length} empleado{people.length === 1 ? '' : 's'} · {ops.length} oportunidad
                    {ops.length === 1 ? '' : 'es'}
                  </div>
                </div>
              </Link>
            );
          })}
          {filtradas.length === 0 && (
            <div className="text-sm text-neutral-500 col-span-2 py-10 text-center border border-dashed border-neutral-200 rounded-xl">
              Todavía no hay empresas. Créala aquí o llegará sola cuando alguien rellene el formulario web.
            </div>
          )}
        </div>
      </div>
    </CrmShell>
  );
}
