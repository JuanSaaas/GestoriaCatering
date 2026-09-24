'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Empresa, Empleado } from '@/lib/types';
import { Avatar, Icon, btnGhost, btnPrimary, inputCls, labelCls } from './ui';
import CompanyLogo from './CompanyLogo';

const NEW = '__new__';

/**
 * Selectores de EMPRESA y EMPLEADO responsable de una oportunidad.
 * Permiten crear una empresa o un empleado nuevo sin salir de la pantalla.
 */
export default function AssignmentFields({
  empresas,
  empleados,
  empresa,
  empleado,
  onEmpresaChange,
  onEmpleadoChange,
  onEmpresaCreated,
  onEmpleadoCreated,
  sugerenciaEmpresa,
}: {
  empresas: Empresa[];
  empleados: Empleado[];
  empresa: Empresa | null;
  empleado: Empleado | null;
  onEmpresaChange: (e: Empresa | null) => void;
  onEmpleadoChange: (e: Empleado | null) => void;
  onEmpresaCreated: (e: Empresa) => void;
  onEmpleadoCreated: (e: Empleado) => void;
  /** Nombre de empresa que escribió el cliente en el formulario web (si lo hay) */
  sugerenciaEmpresa?: string | null;
}) {
  const [creandoEmpresa, setCreandoEmpresa] = useState(false);
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [sectorEmpresa, setSectorEmpresa] = useState('');

  const [creandoEmpleado, setCreandoEmpleado] = useState(false);
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [emailEmpleado, setEmailEmpleado] = useState('');
  const [rolEmpleado, setRolEmpleado] = useState('comercial');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sugerida = sugerenciaEmpresa?.trim() || '';
  const coincidente = sugerida
    ? empresas.find((e) => e.nombre.toLowerCase() === sugerida.toLowerCase())
    : undefined;

  const empresasOrdenadas = [...empresas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const empleadosOrdenados = [...empleados].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  function abrirCrearEmpresa(prefill = '') {
    setError(null);
    setNombreEmpresa(prefill);
    setSectorEmpresa('');
    setCreandoEmpresa(true);
  }

  async function crearEmpresa() {
    const nombre = nombreEmpresa.trim();
    if (!nombre) return;
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('empresas')
      .insert({ nombre, sector: sectorEmpresa.trim() || null })
      .select()
      .single();
    setSaving(false);
    if (err || !data) {
      setError(
        err?.code === '23505'
          ? 'Ya existe una empresa con ese nombre.'
          : 'No se pudo crear la empresa. ¿Has ejecutado la migración SQL de empresas?'
      );
      return;
    }
    onEmpresaCreated(data as Empresa);
    onEmpresaChange(data as Empresa);
    setCreandoEmpresa(false);
  }

  async function crearEmpleado() {
    const nombre = nombreEmpleado.trim();
    const email = emailEmpleado.trim();
    if (!nombre || !email) {
      setError('El nombre y el email del empleado son obligatorios.');
      return;
    }
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('usuarios')
      .insert({ nombre, email, rol: rolEmpleado.trim() || 'comercial' })
      .select()
      .single();
    setSaving(false);
    if (err || !data) {
      setError(err?.code === '23505' ? 'Ya existe un empleado con ese email.' : 'No se pudo crear el empleado.');
      return;
    }
    onEmpleadoCreated(data as Empleado);
    onEmpleadoChange(data as Empleado);
    setNombreEmpleado('');
    setEmailEmpleado('');
    setRolEmpleado('comercial');
    setCreandoEmpleado(false);
  }

  // Enter dentro de los mini-formularios no debe enviar el formulario que los contiene
  const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
      {/* ---------- Empresa ---------- */}
      <div>
        <label className={labelCls} htmlFor="asig-empresa">
          <Icon name="building" className="w-3.5 h-3.5" /> Empresa
        </label>
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
          id="asig-empresa"
          className={inputCls}
          value={creandoEmpresa ? NEW : empresa?.id ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            if (v === NEW) return abrirCrearEmpresa(sugerida && !coincidente ? sugerida : '');
            setCreandoEmpresa(false);
            onEmpresaChange(empresas.find((x) => x.id === v) ?? null);
          }}
        >
          <option value="">Sin empresa</option>
          {empresasOrdenadas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
          <option value={NEW}>＋ Crear empresa nueva…</option>
        </select>
        </div>

        {!empresa && !creandoEmpresa && sugerida && (
          <button
            type="button"
            className="mt-1.5 text-xs text-black hover:underline text-left"
            onClick={() => (coincidente ? onEmpresaChange(coincidente) : abrirCrearEmpresa(sugerida))}
          >
            El cliente indicó «{sugerida}» — {coincidente ? 'asignar esta empresa' : 'crear empresa'}
          </button>
        )}

        {creandoEmpresa && (
          <div className="mt-2 p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2">
              {nombreEmpresa.trim() && (
                <CompanyLogo nombre={nombreEmpresa} size={28} />
              )}
              <input
                className={inputCls}
                placeholder="Nombre de la empresa *"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                onKeyDown={onEnter(crearEmpresa)}
                autoFocus
              />
            </div>
            <input
              className={inputCls}
              placeholder="Sector (opcional)"
              value={sectorEmpresa}
              onChange={(e) => setSectorEmpresa(e.target.value)}
              onKeyDown={onEnter(crearEmpresa)}
            />
            <div className="flex gap-2">
              <button type="button" className={btnPrimary} onClick={crearEmpresa} disabled={saving || !nombreEmpresa.trim()}>
                {saving ? 'Guardando…' : 'Crear y asignar'}
              </button>
              <button type="button" className={btnGhost} onClick={() => setCreandoEmpresa(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Empleado ---------- */}
      <div>
        <label className={labelCls} htmlFor="asig-empleado">
          <Icon name="user" className="w-3.5 h-3.5" /> Empleado responsable
        </label>
        <div className="flex items-center gap-2">
          <Avatar nombre={empleado?.nombre} size={32} />
          <select
            id="asig-empleado"
            className={inputCls}
            value={creandoEmpleado ? NEW : empleado?.id ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              if (v === NEW) {
                setError(null);
                setCreandoEmpleado(true);
                return;
              }
              setCreandoEmpleado(false);
              onEmpleadoChange(empleados.find((x) => x.id === v) ?? null);
            }}
          >
            <option value="">Sin asignar</option>
            {empleadosOrdenados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
                {e.rol ? ` · ${e.rol}` : ''}
              </option>
            ))}
            <option value={NEW}>＋ Añadir empleado nuevo…</option>
          </select>
        </div>

        {creandoEmpleado && (
          <div className="mt-2 p-3 rounded-lg bg-surface border border-line space-y-2 animate-fade-in">
            <input
              className={inputCls}
              placeholder="Nombre y apellidos *"
              value={nombreEmpleado}
              onChange={(e) => setNombreEmpleado(e.target.value)}
              onKeyDown={onEnter(crearEmpleado)}
              autoFocus
            />
            <input
              className={inputCls}
              type="email"
              placeholder="Email *"
              value={emailEmpleado}
              onChange={(e) => setEmailEmpleado(e.target.value)}
              onKeyDown={onEnter(crearEmpleado)}
            />
            <input
              className={inputCls}
              placeholder="Rol (comercial, jefe de sala…)"
              value={rolEmpleado}
              onChange={(e) => setRolEmpleado(e.target.value)}
              onKeyDown={onEnter(crearEmpleado)}
            />
            <div className="flex gap-2">
              <button type="button" className={btnPrimary} onClick={crearEmpleado} disabled={saving}>
                {saving ? 'Guardando…' : 'Añadir y asignar'}
              </button>
              <button type="button" className={btnGhost} onClick={() => setCreandoEmpleado(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="sm:col-span-2 text-xs px-3 py-2 rounded-lg bg-[#FBEAE8] text-wine-dark border border-wine/20">
          {error}
        </div>
      )}
    </div>
  );
}
