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
import { Avatar, btnPrimary, eventoLabel, fmtDate, fmtMoney, inputCls, labelCls } from '@/components/ui';

export default function EmpleadoPerfilPage() {
  const params = useParams<{ id: string }>();
  const [contacto, setContacto] = useState<Cliente | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [supportsCompanyId, setSupportsCompanyId] = useState(false);
  const [supportsRole, setSupportsRole] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await loadCrmDirectory();
      const cli = data.contactos.find((c) => c.id === params.id);
      if (!cli) throw new Error('No se encontró este contacto.');
      setContacto(cli);
      setEmpresas(data.empresas);
      setOps(data.oportunidades.filter((o) => o.cliente_id === cli.id));
      setSupportsCompanyId(data.supportsContactCompanyId);
      setSupportsRole(data.supportsContactRole);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el contacto.');
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
    if (!contacto) return;
    setSaving(true);
    const emp = empresas.find((x) => x.id === contacto.empresa_id);
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: contacto.nombre,
        email: contacto.email,
        telefono: contacto.telefono,
        ...(supportsRole ? { cargo: contacto.cargo } : {}),
        ...(supportsCompanyId ? { empresa_id: contacto.empresa_id } : {}),
        empresa: emp?.nombre || null,
        tipo_cliente: contacto.empresa_id ? 'empresa' : 'particular',
      })
      .eq('id', contacto.id);
    setSaving(false);
    if (error) alert('No se pudo guardar el perfil.');
  }

  if (loading || loadError || !contacto) {
    return (
      <CrmShell>
        <div className="p-8 text-sm text-neutral-500">
          {loading ? 'Cargando perfil...' : loadError || 'No se encontró este contacto.'}
          {!loading && <button type="button" className="underline ml-2" onClick={load}>Reintentar</button>}
        </div>
      </CrmShell>
    );
  }

  const empresa = empresas.find((e) => e.id === contacto.empresa_id) || null;
  const patch = (p: Partial<Cliente>) => setContacto({ ...contacto, ...p });

  return (
    <CrmShell>
      <div className="px-6 py-6 max-w-4xl">
        <Link href="/crm/contactos" className="text-sm text-neutral-500 hover:text-black">
          ← Contactos
        </Link>

        <div className="flex items-center gap-4 mt-4 mb-8">
          <Avatar nombre={contacto.nombre} size={56} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{contacto.nombre}</h1>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
              {empresa && (
                <>
                  <CompanyLogo
                    nombre={empresa.nombre}
                    sitio_web={empresa.sitio_web}
                    email={empresa.email}
                    logo_url={empresa.logo_url}
                    size={18}
                  />
                  <Link href={`/crm/empresas/${empresa.id}`} className="hover:underline">
                    {empresa.nombre}
                  </Link>
                  <span>·</span>
                </>
              )}
              <span>
                {ops.length} oportunidad{ops.length === 1 ? '' : 'es'} creada{ops.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-4 mb-10">
          <div>
            <label className={labelCls}>Nombre</label>
            <input className={inputCls} value={contacto.nombre} onChange={(e) => patch({ nombre: e.target.value })} />
          </div>
          {supportsRole && <div>
            <label className={labelCls}>Cargo</label>
            <input className={inputCls} placeholder="p. ej. Directora de eventos" value={contacto.cargo || ''} onChange={(e) => patch({ cargo: e.target.value })} />
          </div>}
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} value={contacto.email} onChange={(e) => patch({ email: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input className={inputCls} value={contacto.telefono || ''} onChange={(e) => patch({ telefono: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Empresa</label>
            <div className="flex items-center gap-2">
              {empresa && (
                <CompanyLogo
                  nombre={empresa.nombre}
                  sitio_web={empresa.sitio_web}
                  email={empresa.email}
                  logo_url={empresa.logo_url}
                  size={32}
                />
              )}
              <select
                className={inputCls}
                value={contacto.empresa_id || ''}
                onChange={(e) => patch({ empresa_id: e.target.value || null })}
              >
                <option value="">Sin empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <button className={btnPrimary} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar perfil'}
            </button>
          </div>
        </form>

        <h2 className="text-lg font-semibold mb-3">Oportunidades asignadas / creadas</h2>
        <div className="space-y-2">
          {ops.map((o) => {
            const est = ESTADOS.find((e) => e.key === o.estado);
            return (
              <div key={o.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{eventoLabel(o)}</div>
                  <div className="text-xs text-neutral-500">
                    {fmtDate(o.fecha_evento)} · {o.origen === 'formulario_web' ? 'Formulario web' : 'CRM'}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm tabular-nums">{fmtMoney(o.presupuesto_estimado)}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: (est?.color || '#000') + '22', color: est?.color }}
                  >
                    {est?.label}
                  </span>
                </div>
              </div>
            );
          })}
          {ops.length === 0 && <p className="text-sm text-neutral-500">Este contacto aún no tiene oportunidades.</p>}
        </div>
      </div>
    </CrmShell>
  );
}
