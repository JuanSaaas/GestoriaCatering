'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { ESTADOS, OPORTUNIDAD_SELECT } from '@/lib/types';
import CrmShell from '@/components/CrmShell';
import CompanyLogo from '@/components/CompanyLogo';
import { Avatar, btnPrimary, eventoLabel, fmtDate, fmtMoney, inputCls, labelCls } from '@/components/ui';

export default function EmpleadoPerfilPage() {
  const params = useParams<{ id: string }>();
  const [contacto, setContacto] = useState<Cliente | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const id = params.id;
    const [{ data: cli }, { data: emp }, { data: oportunidades }] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', id).single(),
      supabase.from('empresas').select('*').order('nombre'),
      supabase.from('oportunidades').select(OPORTUNIDAD_SELECT).eq('cliente_id', id).order('created_at', { ascending: false }),
    ]);
    setContacto(cli as Cliente);
    setEmpresas((emp as Empresa[]) || []);
    setOps((oportunidades as unknown as Oportunidad[]) || []);
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
        cargo: contacto.cargo,
        empresa_id: contacto.empresa_id,
        empresa: emp?.nombre || contacto.empresa,
        tipo_cliente: contacto.empresa_id ? 'empresa' : contacto.tipo_cliente,
      })
      .eq('id', contacto.id);
    setSaving(false);
    if (error) alert('No se pudo guardar el perfil.');
  }

  if (!contacto) {
    return (
      <CrmShell>
        <div className="p-8 text-sm text-neutral-500">Cargando perfil…</div>
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
          <div>
            <label className={labelCls}>Cargo</label>
            <input className={inputCls} placeholder="p. ej. Directora de eventos" value={contacto.cargo || ''} onChange={(e) => patch({ cargo: e.target.value })} />
          </div>
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
