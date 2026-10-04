'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { loadCrmDirectory } from '@/lib/crmDirectory';
import CrmShell from '@/components/CrmShell';
import CompanyLogo from '@/components/CompanyLogo';
import { Icon, btnGhost, btnPrimary, inputCls } from '@/components/ui';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [contactos, setContactos] = useState<Cliente[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const [sitio, setSitio] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await loadCrmDirectory();
      setEmpresas(data.empresas);
      setOportunidades(data.oportunidades);
      setContactos(data.contactos);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar las empresas.');
    } finally {
      setLoading(false);
    }
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
    setShowForm(false);
    load();
  }

  function exportarCSV() {
    const filas = [
      ['Nombre', 'Sector', 'Ciudad', 'Web', 'Email', 'Teléfono', 'Personas', 'Oportunidades'],
      ...filtradas.map((emp) => [
        emp.nombre,
        emp.sector || '',
        emp.ciudad || '',
        emp.sitio_web || '',
        emp.email || '',
        emp.telefono || '',
        String(contactos.filter((c) => c.empresa_id === emp.id).length),
        String(oportunidades.filter((o) => o.empresa_id === emp.id).length),
      ]),
    ];
    const csv = filas.map((f) => f.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'empresas.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return empresas.filter((e) => !q || `${e.nombre} ${e.ciudad || ''} ${e.sector || ''}`.toLowerCase().includes(q));
  }, [empresas, query]);

  return (
    <CrmShell>
      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Empresas</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {loading ? 'Cargando empresas...' : `${filtradas.length} empresa${filtradas.length === 1 ? '' : 's'} en cartera`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className={btnGhost} onClick={exportarCSV} type="button">
              <Icon name="download" className="w-4 h-4" /> Exportar CSV
            </button>
            <button className={btnPrimary} onClick={() => setShowForm((v) => !v)} type="button">
              <Icon name="plus" className="w-4 h-4" /> Nueva empresa
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={crear} className="flex flex-col sm:flex-row gap-2 mb-6 items-end p-4 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="flex-1 w-full">
              <label className="text-xs text-neutral-500 mb-1.5 block">Nombre de la empresa</label>
              <div className="flex items-center gap-2">
                {nombre.trim() ? <CompanyLogo nombre={nombre} sitio_web={sitio} size={36} /> : null}
                <input className={inputCls} placeholder="Nombre de la empresa" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
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
        )}

        <div className="relative mb-5 max-w-sm">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Buscar por nombre, sector o ciudad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loadError && (
          <div role="alert" className="mb-5 text-sm text-red-700">
            {loadError} <button type="button" className="underline ml-2" onClick={load}>Reintentar</button>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" aria-busy={loading}>
          {filtradas.map((emp) => {
            const ops = oportunidades.filter((o) => o.empresa_id === emp.id);
            const people = contactos.filter((c) => c.empresa_id === emp.id);
            return (
              <Link
                key={emp.id}
                href={`/crm/empresas/${emp.id}`}
                className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[var(--crm-accent)] hover:shadow-card-hover transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyLogo
                    nombre={emp.nombre}
                    sitio_web={emp.sitio_web}
                    email={emp.email}
                    logo_url={emp.logo_url}
                    size={40}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{emp.nombre}</div>
                    <div className="text-xs text-neutral-500 truncate">
                      {[emp.sector, emp.ciudad].filter(Boolean).join(' · ') || 'Sin clasificar'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-center">
                  <div>
                    <div className="text-sm font-semibold tabular-nums">{people.length}</div>
                    <div className="text-[11px] text-neutral-500">Personas</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold tabular-nums">{ops.length}</div>
                    <div className="text-[11px] text-neutral-500">Oport.</div>
                  </div>
                </div>
              </Link>
            );
          })}
          {!loading && !loadError && filtradas.length === 0 && (
            <div className="text-sm text-neutral-500 col-span-full py-10 text-center border border-dashed border-neutral-200 rounded-xl">
              {query.trim() ? 'No hay empresas que coincidan con la búsqueda.' : 'Todavía no hay empresas en cartera.'}
            </div>
          )}
        </div>
      </div>
    </CrmShell>
  );
}
