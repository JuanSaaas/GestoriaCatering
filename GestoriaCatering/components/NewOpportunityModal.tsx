'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Oportunidad, Empresa, Empleado, TipoEvento, EstadoOportunidad } from '@/lib/types';
import { ESTADOS, OPORTUNIDAD_SELECT, TIPO_EVENTO_LABEL } from '@/lib/types';
import AssignmentFields from './AssignmentFields';
import { Icon, Section, btnGhost, btnPrimary, inputCls, labelCls } from './ui';

export default function NewOpportunityModal({
  empresas,
  empleados,
  empleadoInicial,
  onClose,
  onCreated,
  onEmpresaCreated,
  onEmpleadoCreated,
}: {
  empresas: Empresa[];
  empleados: Empleado[];
  empleadoInicial: Empleado | null;
  onClose: () => void;
  onCreated: (o: Oportunidad) => void;
  onEmpresaCreated: (e: Empresa) => void;
  onEmpleadoCreated: (e: Empleado) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('boda');
  const [tipoEventoOtro, setTipoEventoOtro] = useState('');
  const [fecha, setFecha] = useState('');
  const [invitados, setInvitados] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState<EstadoOportunidad>('nuevo');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empleado, setEmpleado] = useState<Empleado | null>(empleadoInicial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const emailLimpio = email.trim();

    // Si el contacto ya existe (mismo email) lo reutilizamos sin pisar sus datos
    let clienteId: string;
    const { data: existente } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', emailLimpio)
      .maybeSingle();

    if (existente) {
      clienteId = existente.id;
    } else {
      const { data: nuevo, error: cErr } = await supabase
        .from('clientes')
        .insert({
          tipo_cliente: empresa ? 'empresa' : 'particular',
          nombre: nombre.trim(),
          empresa: empresa?.nombre ?? null,
          email: emailLimpio,
          telefono: telefono.trim() || null,
        })
        .select('id')
        .single();
      if (cErr || !nuevo) {
        console.error(cErr);
        setError('No se pudo guardar el contacto.');
        setSaving(false);
        return;
      }
      clienteId = nuevo.id;
    }

    const { data: op, error: oErr } = await supabase
      .from('oportunidades')
      .insert({
        cliente_id: clienteId,
        comercial_id: empleado?.id ?? null,
        empresa_id: empresa?.id ?? null,
        tipo_evento: tipoEvento,
        tipo_evento_otro: tipoEvento === 'otro' ? tipoEventoOtro.trim() : null,
        fecha_evento: fecha || null,
        num_invitados: invitados ? Number(invitados) : null,
        presupuesto_estimado: presupuesto ? Number(presupuesto) : null,
        mensaje: mensaje.trim() || null,
        estado,
        origen: 'crm',
      })
      .select(OPORTUNIDAD_SELECT)
      .single();

    setSaving(false);
    if (oErr || !op) {
      console.error(oErr);
      setError('No se pudo crear la oportunidad. ¿Has ejecutado la migración SQL de empresas?');
      return;
    }
    onCreated(op as unknown as Oportunidad);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/45 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nueva oportunidad"
        className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-line">
          <div>
            <h2 className="text-lg font-semibold">Nueva oportunidad</h2>
            <p className="text-sm text-ink-soft">Asóciala a una empresa y a un empleado desde el primer momento.</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 -mr-1.5 rounded-lg text-ink-soft hover:bg-surface">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="overflow-y-auto px-6 py-5 space-y-7">
            <Section title="Asignación">
              <AssignmentFields
                empresas={empresas}
                empleados={empleados}
                empresa={empresa}
                empleado={empleado}
                onEmpresaChange={setEmpresa}
                onEmpleadoChange={setEmpleado}
                onEmpresaCreated={onEmpresaCreated}
                onEmpleadoCreated={onEmpleadoCreated}
              />
            </Section>

            <Section title="Contacto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="n-nombre">Persona de contacto *</label>
                  <input id="n-nombre" className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls} htmlFor="n-email">Email *</label>
                  <input id="n-email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls} htmlFor="n-tel">Teléfono</label>
                  <input id="n-tel" type="tel" className={inputCls} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
              </div>
            </Section>

            <Section title="Evento">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <label className={labelCls} htmlFor="n-tipo">Tipo de evento</label>
                  <select id="n-tipo" className={inputCls} value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value as TipoEvento)}>
                    {(Object.keys(TIPO_EVENTO_LABEL) as TipoEvento[]).map((k) => (
                      <option key={k} value={k}>{TIPO_EVENTO_LABEL[k]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="n-fecha">Fecha prevista</label>
                  <input id="n-fecha" type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
                {tipoEvento === 'otro' && (
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor="n-otro">¿Qué tipo de evento es? *</label>
                    <input id="n-otro" className={inputCls} value={tipoEventoOtro} onChange={(e) => setTipoEventoOtro(e.target.value)} required />
                  </div>
                )}
                <div>
                  <label className={labelCls} htmlFor="n-inv">Nº de invitados</label>
                  <input id="n-inv" type="number" min={1} className={inputCls} value={invitados} onChange={(e) => setInvitados(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="n-pres">Presupuesto estimado (€)</label>
                  <input id="n-pres" type="number" min={0} step={50} className={inputCls} value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="n-estado">Fase inicial</label>
                  <select id="n-estado" className={inputCls} value={estado} onChange={(e) => setEstado(e.target.value as EstadoOportunidad)}>
                    {ESTADOS.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="n-msg">Notas / requisitos</label>
                  <textarea
                    id="n-msg"
                    className={`${inputCls} h-auto min-h-[84px] py-2.5 resize-y`}
                    placeholder="Estilo del evento, restricciones alimentarias, ubicación…"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                  />
                </div>
              </div>
            </Section>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg bg-[#FBEAE8] text-wine-dark border border-wine/20">{error}</div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t border-line bg-surface/60">
            <button type="button" className={btnGhost} onClick={onClose}>Cancelar</button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? 'Creando…' : 'Crear oportunidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
