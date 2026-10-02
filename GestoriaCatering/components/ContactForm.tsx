'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { TipoEvento, FranjaHoraria } from '@/lib/types';
import { FRANJA_HORARIA_LABEL, ORIGEN_CONTACTO_LABEL } from '@/lib/types';

type Status = 'idle' | 'sending' | 'ok' | 'error';

// Para estos tipos de evento el campo "empresa" no tiene sentido (son celebraciones
// personales), así que no se muestra. Para el resto (corporativo, otro) sí aparece.
const EVENTOS_SIN_EMPRESA: TipoEvento[] = ['boda', 'comunion', 'cumpleanos'];

export default function ContactForm() {
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('boda');
  const [status, setStatus] = useState<Status>('idle');
  const mostrarEmpresa = !EVENTOS_SIN_EMPRESA.includes(tipoEvento);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = new FormData(form);

    const eventoActual = data.get('tipoEvento') as TipoEvento;
    const empresaNombre = !EVENTOS_SIN_EMPRESA.includes(eventoActual)
      ? String(data.get('empresa') || '').trim()
      : '';

    let empresaId: string | null = null;
    if (empresaNombre) {
      const { data: existenteEmp } = await supabase
        .from('empresas')
        .select('*')
        .ilike('nombre', empresaNombre)
        .maybeSingle();
      if (existenteEmp) {
        empresaId = existenteEmp.id;
      } else {
        const { data: nuevaEmp } = await supabase
          .from('empresas')
          .insert({ nombre: empresaNombre })
          .select('id')
          .single();
        empresaId = nuevaEmp?.id ?? null;
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

    if (clienteError) {
      const { empresa_id: _omit, ...sinEmpresaId } = clientePayload;
      const retry = await supabase.from('clientes').upsert(sinEmpresaId, { onConflict: 'email' }).select().single();
      cliente = retry.data;
      clienteError = retry.error;
    }

    if (clienteError || !cliente) {
      console.error(clienteError);
      setStatus('error');
      return;
    }

    const oportunidadPayload = {
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

    let { error } = await supabase.from('oportunidades').insert(oportunidadPayload);

    if (error) {
      // Si la migración de columnas nuevas (franja, ubicación, restricciones,
      // origen) aún no se ha aplicado en Supabase, reintentamos sin ellas para
      // no bloquear el envío del formulario por completo.
      const { franja_horaria, ubicacion_evento, restricciones, como_nos_conocio, ...basico } = oportunidadPayload;
      const retry = await supabase.from('oportunidades').insert(basico);
      error = retry.error;
    }

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('ok');
      form.reset();
      setTipoEvento('boda');
    }
  }

  const inputClass =
    'w-full px-0 py-2.5 text-sm bg-transparent border-0 border-b border-[var(--line)] focus:outline-none focus:border-ink transition-colors';
  const labelClass = 'block text-xs uppercase tracking-wide text-ink-soft mb-1.5';

  return (
    <div className="bg-paper-2 p-8 md:p-10">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <div>
            <label className={labelClass} htmlFor="nombre">Nombre y apellidos</label>
            <input className={inputClass} id="nombre" name="nombre" type="text" required />
          </div>
          {mostrarEmpresa && (
            <div>
              <label className={labelClass} htmlFor="empresa">Nombre de la empresa</label>
              <input className={inputClass} id="empresa" name="empresa" type="text" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input className={inputClass} id="email" name="email" type="email" required />
          </div>
          <div>
            <label className={labelClass} htmlFor="telefono">Teléfono</label>
            <input className={inputClass} id="telefono" name="telefono" type="tel" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <div>
            <label className={labelClass} htmlFor="tipoEvento">Tipo de evento</label>
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

        {tipoEvento === 'otro' && (
          <div className="mb-5">
            <label className={labelClass} htmlFor="tipoEventoOtro">¿Qué tipo de evento es?</label>
            <input
              className={inputClass}
              id="tipoEventoOtro"
              name="tipoEventoOtro"
              type="text"
              placeholder="Ej. aniversario, bautizo, inauguración..."
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <div>
            <label className={labelClass} htmlFor="numInvitados">Nº aprox. de invitados</label>
            <input className={inputClass} id="numInvitados" name="numInvitados" type="number" min={1} />
          </div>
          <div>
            <label className={labelClass} htmlFor="presupuesto">Presupuesto orientativo (€)</label>
            <input className={inputClass} id="presupuesto" name="presupuesto" type="number" min={0} step={50} />
          </div>
        </div>

        <div className="mb-5">
          <label className={labelClass} htmlFor="restricciones">Restricciones alimentarias o alergias</label>
          <input
            className={inputClass}
            id="restricciones"
            name="restricciones"
            type="text"
            placeholder="Celiaquía, vegano, alergias a frutos secos…"
          />
        </div>

        <div className="mb-7">
          <label className={labelClass} htmlFor="mensaje">Cuéntanos más</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            id="mensaje"
            name="mensaje"
            placeholder="Estilo del evento, ubicación, ideas que tengas en mente..."
          />
        </div>

        <div className="mb-7">
          <label className={labelClass} htmlFor="comoNosConocio">¿Cómo nos has conocido?</label>
          <select className={inputClass} id="comoNosConocio" name="comoNosConocio" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            {Object.entries(ORIGEN_CONTACTO_LABEL).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-3.5 bg-ink text-paper text-sm tracking-wide hover:bg-gold hover:text-ink transition-colors disabled:opacity-60"
        >
          {status === 'sending' ? 'Enviando...' : 'Enviar solicitud'}
        </button>

        {status === 'ok' && (
          <div className="mt-4 text-sm px-4 py-3 bg-[#EFEBE2] text-ink border-l-2 border-gold">
            Solicitud recibida. Te contactaremos muy pronto.
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 text-sm px-4 py-3 bg-[#F5E2E0] text-wine-dark border-l-2 border-wine">
            No hemos podido enviar tu solicitud. Inténtalo de nuevo en unos minutos.
          </div>
        )}
      </form>
    </div>
  );
}
