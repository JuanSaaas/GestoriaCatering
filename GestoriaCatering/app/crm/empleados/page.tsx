'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { OPORTUNIDAD_SELECT } from '@/lib/types';
import CrmShell from '@/components/CrmShell';
import CompanyLogo from '@/components/CompanyLogo';
import { Avatar, Icon, inputCls } from '@/components/ui';

type Contacto = Cliente & { empresa_rel?: Empresa | null };

export default function EmpleadosPage() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const [c, e, o] = await Promise.all([
        supabase.from('clientes').select('*').order('created_at', { ascending: false }),
        supabase.from('empresas').select('*'),
        supabase.from('oportunidades').select(OPORTUNIDAD_SELECT),
      ]);
      setContactos((c.data as Contacto[]) || []);
      setEmpresas((e.data as Empresa[]) || []);
      setOps((o.data as unknown as Oportunidad[]) || []);
    })();
  }, []);

  const empresaById = useMemo(() => Object.fromEntries(empresas.map((e) => [e.id, e])), [empresas]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contactos.filter((c) => {
      const emp = c.empresa_id ? empresaById[c.empresa_id] : null;
      const hay = [c.nombre, c.email, c.empresa, emp?.nombre].filter(Boolean).join(' ').toLowerCase();
      return !q || hay.includes(q);
    });
  }, [contactos, query, empresaById]);

  return (
    <CrmShell>
      <div className="px-6 py-6 max-w-5xl">
        <h1 className="text-2xl font-semibold">Empleados que nos han contactado</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Personas que han escrito desde el formulario o el CRM, enlazadas a su empresa.
        </p>

        <div className="relative mb-5 max-w-sm">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input className={`${inputCls} pl-9`} placeholder="Buscar por nombre o empresa…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="space-y-2">
          {filtrados.map((c) => {
            const emp =
              (c.empresa_id && empresaById[c.empresa_id]) ||
              empresas.find((e) => e.nombre.toLowerCase() === (c.empresa || '').toLowerCase()) ||
              null;
            const suyas = ops.filter((o) => o.cliente_id === c.id);
            return (
              <Link
                key={c.id}
                href={`/crm/empleados/${c.id}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:border-black transition"
              >
                <Avatar nombre={c.nombre} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{c.nombre}</div>
                  <div className="text-xs text-neutral-500 truncate">{c.email}</div>
                </div>
                {emp && (
                  <span className="hidden sm:inline-flex items-center gap-2 text-sm text-neutral-600">
                    <CompanyLogo
                      nombre={emp.nombre}
                      sitio_web={emp.sitio_web}
                      email={emp.email}
                      logo_url={emp.logo_url}
                      size={22}
                    />
                    {emp.nombre}
                  </span>
                )}
                <span className="text-xs text-neutral-500 whitespace-nowrap">{suyas.length} opp.</span>
              </Link>
            );
          })}
          {filtrados.length === 0 && (
            <div className="text-sm text-neutral-500 py-10 text-center border border-dashed border-neutral-200 rounded-xl">
              Nadie ha contactado todavía.
            </div>
          )}
        </div>
      </div>
    </CrmShell>
  );
}
