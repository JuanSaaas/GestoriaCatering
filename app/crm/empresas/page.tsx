'use client';

import ValidatedForm from '@/components/ValidatedForm';

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
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState('');
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
    try {
    setSaveError('');
    setNotice('');
    const { error } = await supabase.from('empresas').insert({
      nombre: nombre.trim(),
      sitio_web: sitio.trim() || null,
    });
    setSaving(false);
    if (error) {
      setSaveError(error.code === '23505' ? 'Ya existe una empresa con ese nombre. Abre su ficha desde la lista.' : 'No se pudo crear la empresa. Revisa tu conexión y vuelve a intentarlo.');
      return;
    }
    setNotice('✓ Empresa creada. Puedes abrir su ficha desde la lista.');
    setNombre('');
    setSitio('');
    setShowForm(false);
    load();
    } catch { setSaveError('No se pudo crear la empresa. Revisa tu conexión y vuelve a intentarlo.'); }
    finally { setSaving(false); }
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
            <button className={showForm ? btnGhost : btnPrimary} aria-expanded={showForm} onClick={() => setShowForm((v) => !v)} type="button">
              <Icon name="plus" className="w-4 h-4" /> Nueva empresa
            </button>
          </div>
        </div>

        {notice && <p role="status" className="mb-4 text-sm">{notice}</p>}
        {saveError && <p role="alert" className="mb-4 text-sm">⚠ {saveError}</p>}
        {showForm && (
          <ValidatedForm onSubmit={crear} className="flex flex-col gap-4 mb-6 items-start p-4 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="flex-1 w-full">
              <label htmlFor="company-name" className="text-sm font-medium text-neutral-700 mb-2 block">Nombre de la empresa *</label>
              <div className="flex items-center gap-2">
                {nombre.trim() ? <CompanyLogo nombre={nombre} sitio_web={sitio} size={36} /> : null}
                <input id="company-name" required className={inputCls} placeholder="Ej. Eventos Zaragoza" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label htmlFor="company-web" className="text-sm font-medium text-neutral-700 mb-2 block">Web (opcional)</label>
              <input id="company-web" className={inputCls} placeholder="empresa.com" value={sitio} onChange={(e) => setSitio(e.target.value)} />
            </div>
            <button className={btnPrimary} disabled={saving || !nombre.trim()}>
              {saving ? 'Guardando…' : 'Crear empresa'}
            </button>
          </ValidatedForm>
        )}

        <div className="relative mb-5 max-w-sm">
          <Icon name="search" className="w-4 h-4 absolute left-3 bottom-4 text-neutral-400" />
          <label htmlFor="list-search" className="block text-sm font-medium text-neutral-700 mb-2">Buscar empresas</label>
              <input id="list-search" type="search"
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
              <p>{query.trim() ? 'No hay empresas que coincidan con la búsqueda.' : 'Todavía no hay empresas en cartera.'}</p>
              <button type="button" className={`${btnGhost} mt-4`} onClick={() => query.trim() ? setQuery('') : setShowForm(true)}>{query.trim() ? 'Limpiar búsqueda' : 'Añadir primera empresa'}</button>
            </div>
          )}
        </div>
      </div>
    </CrmShell>
  );
}
