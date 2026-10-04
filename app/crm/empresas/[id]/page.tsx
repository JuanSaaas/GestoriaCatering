'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { ESTADOS } from '@/lib/types';
import { loadCrmDirectory } from '@/lib/crmDirectory';
import CrmShell from '@/components/CrmShell';
import CompanyLogo from '@/components/CompanyLogo';
import { Avatar, btnPrimary, eventoLabel, fmtMoney, inputCls, labelCls } from '@/components/ui';

export default function EmpresaPerfilPage() {
  const params = useParams<{ id: string }>();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [contactos, setContactos] = useState<Cliente[]>([]);
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await loadCrmDirectory();
      const emp = data.empresas.find((e) => e.id === params.id);
      if (!emp) throw new Error('No se encontró esta empresa.');
      setEmpresa(emp);
      setContactos(data.contactos.filter((c) => c.empresa_id === emp.id));
      setOps(data.oportunidades.filter((o) => o.empresa_id === emp.id));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!empresa) return;
    setSaving(true);
    const { error } = await supabase
      .from('empresas')
      .update({
        nombre: empresa.nombre,
        sitio_web: empresa.sitio_web,
        email: empresa.email,
        telefono: empresa.telefono,
        sector: empresa.sector,
        ciudad: empresa.ciudad,
        cif: empresa.cif,
        logo_url: empresa.logo_url,
      })
      .eq('id', empresa.id);
    setSaving(false);
    if (error) alert('No se pudo guardar.');
  }

  if (loading || loadError || !empresa) {
    return (
      <CrmShell>
        <div className="p-8 text-sm text-neutral-500">
          {loading ? 'Cargando perfil...' : loadError || 'No se encontró esta empresa.'}
          {!loading && <button type="button" className="underline ml-2" onClick={load}>Reintentar</button>}
        </div>
      </CrmShell>
    );
  }

  const patch = (p: Partial<Empresa>) => setEmpresa({ ...empresa, ...p });

  return (
    <CrmShell>
      <div className="px-6 py-6 max-w-4xl">
        <Link href="/crm/empresas" className="text-sm text-neutral-500 hover:text-black">
          ← Empresas
        </Link>

        <div className="flex items-center gap-4 mt-4 mb-8">
          <CompanyLogo
            nombre={empresa.nombre}
            sitio_web={empresa.sitio_web}
            email={empresa.email}
            logo_url={empresa.logo_url}
            size={64}
          />
          <div>
            <h1 className="text-2xl font-semibold">{empresa.nombre || 'Empresa'}</h1>
            <p className="text-sm text-neutral-500">
              {contactos.length} contacto{contactos.length === 1 ? '' : 's'} · {ops.length} oportunidad
              {ops.length === 1 ? '' : 'es'}
            </p>
          </div>
        </div>

        <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nombre</label>
            <div className="flex items-center gap-2">
              <CompanyLogo
                nombre={empresa.nombre}
                sitio_web={empresa.sitio_web}
                email={empresa.email}
                logo_url={empresa.logo_url}
                size={36}
              />
              <input className={inputCls} value={empresa.nombre} onChange={(e) => patch({ nombre: e.target.value })} />
            </div>
            <p className="text-xs text-neutral-400 mt-1">El logo pequeño se actualiza al rellenar el nombre o la web.</p>
          </div>
          <div>
            <label className={labelCls}>Sitio web</label>
            <input
              className={inputCls}
              placeholder="www.empresa.com"
              value={empresa.sitio_web || ''}
              onChange={(e) => patch({ sitio_web: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>URL de logo (opcional)</label>
            <input className={inputCls} value={empresa.logo_url || ''} onChange={(e) => patch({ logo_url: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} value={empresa.email || ''} onChange={(e) => patch({ email: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input className={inputCls} value={empresa.telefono || ''} onChange={(e) => patch({ telefono: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Sector</label>
            <input className={inputCls} value={empresa.sector || ''} onChange={(e) => patch({ sector: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Ciudad</label>
            <input className={inputCls} value={empresa.ciudad || ''} onChange={(e) => patch({ ciudad: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>CIF</label>
            <input className={inputCls} value={empresa.cif || ''} onChange={(e) => patch({ cif: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button className={btnPrimary} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar perfil'}
            </button>
          </div>
        </form>

        <h2 className="text-lg font-semibold mb-3">Contactos</h2>
        <div className="space-y-2 mb-10">
          {contactos.map((c) => (
            <Link
              key={c.id}
              href={`/crm/contactos/${c.id}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-[var(--crm-accent)]"
            >
              <Avatar nombre={c.nombre} />
              <div>
                <div className="text-sm font-medium">{c.nombre}</div>
                <div className="text-xs text-neutral-500">{c.cargo || c.email}</div>
              </div>
            </Link>
          ))}
          {contactos.length === 0 && <p className="text-sm text-neutral-500">Aún no hay contactos ligados a esta empresa.</p>}
        </div>

        <h2 className="text-lg font-semibold mb-3">Oportunidades</h2>
        <div className="space-y-2">
          {ops.map((o) => {
            const est = ESTADOS.find((e) => e.key === o.estado);
            return (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                <div>
                  <div className="text-sm font-medium">{eventoLabel(o)}</div>
                  <div className="text-xs text-neutral-500">{o.cliente.nombre}</div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="tabular-nums">{fmtMoney(o.presupuesto_estimado)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (est?.color || '#000') + '22', color: est?.color }}>
                    {est?.label}
                  </span>
                </div>
              </div>
            );
          })}
          {ops.length === 0 && <p className="text-sm text-neutral-500">Sin oportunidades asociadas.</p>}
        </div>
      </div>
    </CrmShell>
  );
}
