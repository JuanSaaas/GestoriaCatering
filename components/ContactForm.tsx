'use client';

import FormSteps from '@/components/FormSteps';
import ValidatedForm from '@/components/ValidatedForm';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { TipoEvento, FranjaHoraria } from '@/lib/types';
import { FRANJA_HORARIA_LABEL, ORIGEN_CONTACTO_LABEL } from '@/lib/types';

type Status = 'idle' | 'sending' | 'ok' | 'error';

// Para estos tipos de evento el campo "empresa" no tiene sentido (son celebraciones
// personales), así que no se muestra. Para el resto (corporativo, otro) sí aparece.
const EVENTOS_SIN_EMPRESA: TipoEvento[] = ['boda', 'comunion', 'cumpleanos'];

export default function ContactForm() {
  const sending = useRef(false);
  const requestId = useRef<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('boda');
  const [status, setStatus] = useState<Status>('idle');
  const mostrarEmpresa = !EVENTOS_SIN_EMPRESA.includes(tipoEvento);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending.current) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    requestId.current ??= crypto.randomUUID();
    sending.current = true;
    setStatus('sending');
    try {

    const eventoActual = data.get('tipoEvento') as TipoEvento;
    const empresaNombre = !EVENTOS_SIN_EMPRESA.includes(eventoActual)
      ? String(data.get('empresa') || '').trim()
      : '';

    let empresaId: string | null = null;
    if (empresaNombre) {
      const { data: existenteEmp, error: empresaLookupError } = await supabase
        .from('empresas')
        .select('*')
        .ilike('nombre', empresaNombre)
        .maybeSingle();
      if (empresaLookupError) throw empresaLookupError;
      if (existenteEmp) {
        empresaId = existenteEmp.id;
      } else {
        const { data: nuevaEmp, error: empresaError } = await supabase
          .from('empresas')
          .insert({ nombre: empresaNombre })
          .select('id')
          .single();
        if (empresaError || !nuevaEmp) throw empresaError || new Error('No se pudo guardar la empresa.');
        empresaId = nuevaEmp.id;
      }
    }

    const clientePayload = {
      tipo_cliente: empresaNombre ? 'empresa' : 'particular',
      nombre: String(data.get('nombre') || '').trim(),
      empresa: empresaNombre || null,
      empresa_id: empresaId,
      email: String(data.get('email') || '').trim(),
      telefono: String(data.get('telefono') || '').trim(),
    };

    // Un mismo email puede volver a escribir para otro evento: usamos upsert
    // por email para no duplicar el cliente (ver UNIQUE(email) en schema.sql).
    let { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .upsert(clientePayload, { onConflict: 'email' })
      .select()
      .single();

    if (clienteError || !cliente) {
      console.error(clienteError);
      setStatus('error');
      return;
    }

    const oportunidadPayload = {
      id: requestId.current,
      cliente_id: cliente.id,
      tipo_evento: data.get('tipoEvento') as TipoEvento,
      tipo_evento_otro:
        (data.get('tipoEvento') as TipoEvento) === 'otro'
          ? String(data.get('tipoEventoOtro') || '').trim()
          : null,
      fecha_evento: (data.get('fechaEvento') as string) || null,
      franja_horaria: (data.get('franjaHoraria') as string) || null,
      ubicacion_evento: String(data.get('ubicacionEvento') || '').trim() || null,
      num_invitados: data.get('numInvitados') ? Number(data.get('numInvitados')) : null,
      presupuesto_estimado: data.get('presupuesto') ? Number(data.get('presupuesto')) : null,
      restricciones: String(data.get('restricciones') || '').trim() || null,
      como_nos_conocio: (data.get('comoNosConocio') as string) || null,
      mensaje: String(data.get('mensaje') || '').trim(),
      estado: 'nuevo' as const,
      origen: 'formulario_web',
      empresa_id: empresaId,
    };

    const { error } = await supabase.from('oportunidades').insert(oportunidadPayload).retry(false);

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('ok');
      requestId.current = null;
      form.reset();
      setTipoEvento('boda');
      setFormVersion((value) => value + 1);
    }
    } catch {
      setStatus('error');
    } finally {
      sending.current = false;
    }
  }

  const inputClass = 'w-full min-h-12 px-4 py-3 text-sm bg-white border border-neutral-300 rounded-lg focus:border-ink transition-colors';
  const labelClass = 'block text-sm font-medium text-ink mb-2';

  return (
    <div className="public-contact bg-paper-2 p-8 md:p-10">
      <ValidatedForm onSubmit={handleSubmit}>
        <FormSteps key={formVersion} disabled={status === 'sending'} submitLabel="Enviar solicitud" busyLabel="Enviando…" steps={[
          { title: 'Tus datos de contacto', content: <>        <div className="grid grid-cols-1 gap-x-6 gap-y-6 mb-6">
          <div>
            <label className={labelClass} htmlFor="nombre">Nombre y apellidos *</label>
            <input className={inputClass} id="nombre" name="nombre" type="text" autoComplete="name" required />
          </div>

        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 mb-6">
          <div>
            <label className={labelClass} htmlFor="email">Correo electrónico *</label>
            <input className={inputClass} id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <label className={labelClass} htmlFor="telefono">Teléfono</label>
            <input className={inputClass} id="telefono" name="telefono" type="tel" autoComplete="tel" />
          </div>
        </div>

</> },
          { title: 'Datos del evento', content: <>          <div hidden={!mostrarEmpresa}>
              <label className={labelClass} htmlFor="empresa">Nombre de la empresa</label>
              <input className={inputClass} id="empresa" name="empresa" type="text" />
            </div>        <div className="grid grid-cols-1 gap-x-6 gap-y-6 mb-6">
          <div>
            <label className={labelClass} htmlFor="tipoEvento">Tipo de evento *</label>
            <select
              className={inputClass}
              id="tipoEvento"
              name="tipoEvento"
              required
              value={tipoEvento}
              onChange={(e) => setTipoEvento(e.target.value as TipoEvento)}
            >
              <option value="boda">Boda</option>
              <option value="corporativo">Evento corporativo</option>
              <option value="comunion">Comunión</option>
              <option value="cumpleanos">Cumpleaños</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="fechaEvento">Fecha prevista</label>
            <input className={inputClass} id="fechaEvento" name="fechaEvento" type="date" />
          </div>
        </div>

        <div hidden={tipoEvento !== 'otro'} className="mb-6">
            <label className={labelClass} htmlFor="tipoEventoOtro">¿Qué tipo de evento es? *</label>
            <input
              className={inputClass}
              id="tipoEventoOtro"
              name="tipoEventoOtro"
              type="text"
              placeholder="Ej. aniversario, bautizo, inauguración..."
              disabled={tipoEvento !== 'otro'}
              required={tipoEvento === 'otro'}
            />
          </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 mb-6">
          <div>
            <label className={labelClass} htmlFor="franjaHoraria">Franja horaria</label>
            <select className={inputClass} id="franjaHoraria" name="franjaHoraria" defaultValue="">
              <option value="" disabled>Selecciona una opción</option>
              {(Object.keys(FRANJA_HORARIA_LABEL) as FranjaHoraria[]).map((k) => (
                <option key={k} value={k}>{FRANJA_HORARIA_LABEL[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ubicacionEvento">Ubicación del evento</label>
            <input
              className={inputClass}
              id="ubicacionEvento"
              name="ubicacionEvento"
              type="text"
              placeholder="Ciudad, finca, dirección…"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 mb-6">
          <div>
            <label className={labelClass} htmlFor="numInvitados">Nº aprox. de invitados</label>
            <input className={inputClass} id="numInvitados" name="numInvitados" type="number" min={1} />
          </div>
          <div>
            <label className={labelClass} htmlFor="presupuesto">Presupuesto orientativo (€)</label>
            <input className={inputClass} id="presupuesto" name="presupuesto" type="number" min={0} step="0.01" />
          </div>
        </div>

</> },
          { title: 'Preferencias y solicitud', content: <>        <div className="mb-6">
          <label className={labelClass} htmlFor="restricciones">Restricciones alimentarias o alergias</label>
          <input
            className={inputClass}
            id="restricciones"
            name="restricciones"
            type="text"
            placeholder="Celiaquía, vegano, alergias a frutos secos…"
          />
        </div>

        <div className="mb-6">
          <label className={labelClass} htmlFor="mensaje">Cuéntanos más</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            id="mensaje"
            name="mensaje"
            placeholder="Estilo del evento, ubicación, ideas que tengas en mente..."
          />
        </div>

        <div className="mb-6">
          <label className={labelClass} htmlFor="comoNosConocio">¿Cómo nos has conocido?</label>
          <select className={inputClass} id="comoNosConocio" name="comoNosConocio" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            {Object.entries(ORIGEN_CONTACTO_LABEL).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>

</> },
        ]} />


        {status === 'ok' && (
          <div role="status" className="mt-4 text-sm px-4 py-3 bg-[#EFEBE2] text-ink border-l-2 border-gold">
            ✓ Solicitud recibida. Te contactaremos muy pronto.
          </div>
        )}
        {status === 'error' && (
          <div role="alert" className="mt-4 text-sm px-4 py-3 bg-[#F5E2E0] text-wine-dark border-l-2 border-wine">
            ⚠ No hemos podido enviar tu solicitud. Tus respuestas se conservan. Revisa la conexión y vuelve a pulsar Enviar solicitud.
          </div>
        )}
      </ValidatedForm>
    </div>
  );
}
