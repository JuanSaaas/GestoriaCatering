'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { TipoCliente, TipoEvento } from '@/lib/types';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export default function ContactForm() {
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('particular');
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('boda');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = new FormData(form);

    const empresaNombre =
      tipoCliente === 'empresa' ? String(data.get('empresa') || '').trim() : '';

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
      tipo_cliente: tipoCliente,
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
      num_invitados: data.get('numInvitados') ? Number(data.get('numInvitados')) : null,
      presupuesto_estimado: data.get('presupuesto') ? Number(data.get('presupuesto')) : null,
      mensaje: String(data.get('mensaje') || '').trim(),
      estado: 'nuevo' as const,
      origen: 'formulario_web',
      empresa_id: empresaId,
    };

    const { error } = await supabase.from('oportunidades').insert(oportunidadPayload);

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('ok');
      form.reset();
      setTipoCliente('particular');
      setTipoEvento('boda');
    }
  }

  const inputClass =
    'w-full px-0 py-2.5 text-sm bg-transparent border-0 border-b border-[var(--line)] focus:outline-none focus:border-ink transition-colors';
  const labelClass = 'block text-xs uppercase tracking-wide text-ink-soft mb-1.5';

  return (
    <div className="bg-paper-2 p-8 md:p-10">
      <div className="flex gap-2.5 mb-7">
        <button
          type="button"
          onClick={() => setTipoCliente('particular')}
          className={`flex-1 py-2.5 text-sm border transition-colors ${
            tipoCliente === 'particular'
              ? 'bg-ink text-paper border-ink'
              : 'bg-transparent text-ink-soft border-[var(--line)]'
          }`}
        >
          Soy particular
        </button>
        <button
          type="button"
          onClick={() => setTipoCliente('empresa')}
          className={`flex-1 py-2.5 text-sm border transition-colors ${
            tipoCliente === 'empresa'
              ? 'bg-ink text-paper border-ink'
              : 'bg-transparent text-ink-soft border-[var(--line)]'
          }`}
        >
          Somos una empresa
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <div>
            <label className={labelClass} htmlFor="nombre">Nombre y apellidos</label>
            <input className={inputClass} id="nombre" name="nombre" type="text" required />
          </div>
          {tipoCliente === 'empresa' && (
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
            <label className={labelClass} htmlFor="numInvitados">Nº aprox. de invitados</label>
            <input className={inputClass} id="numInvitados" name="numInvitados" type="number" min={1} />
          </div>
          <div>
            <label className={labelClass} htmlFor="presupuesto">Presupuesto orientativo (€)</label>
            <input className={inputClass} id="presupuesto" name="presupuesto" type="number" min={0} step={50} />
          </div>
        </div>

        <div className="mb-7">
          <label className={labelClass} htmlFor="mensaje">Cuéntanos más</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            id="mensaje"
            name="mensaje"
            placeholder="Estilo del evento, restricciones alimentarias, ubicación..."
          />
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
