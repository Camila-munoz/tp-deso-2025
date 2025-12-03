"use client";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datos: any) => void;
  habitacionInfo: { numero: string; fechaIn: string; fechaOut: string; noches: number };
}

export default function ModalReserva({ isOpen, onClose, onConfirm, habitacionInfo }: Props) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "", email: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-96 border-t-8 border-yellow-400">
        <h3 className="font-bold text-lg text-yellow-900 mb-4">📅 Nueva Reserva</h3>

        {paso === 1 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded text-sm text-gray-700 space-y-2 border border-yellow-100">
              <p><strong>Habitación:</strong> {habitacionInfo.numero}</p>
              <p><strong>Ingreso:</strong> {habitacionInfo.fechaIn} (12:00)</p>
              <p><strong>Egreso:</strong> {habitacionInfo.fechaOut} (10:00)</p>
              <p className="text-right text-xs font-bold">Total: {habitacionInfo.noches} noches</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 border py-2 rounded hover:bg-gray-100">RECHAZAR</button>
              <button onClick={()=>setPaso(2)} className="flex-1 bg-yellow-400 py-2 rounded font-bold hover:bg-yellow-500">ACEPTAR</button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Datos del contacto (Eventual Huésped):</p>
            <input placeholder="APELLIDO *" className="border p-2 w-full rounded uppercase" onChange={e=>setForm({...form, apellido:e.target.value.toUpperCase()})} />
            <input placeholder="NOMBRE *" className="border p-2 w-full rounded uppercase" onChange={e=>setForm({...form, nombre:e.target.value.toUpperCase()})} />
            <input placeholder="TELÉFONO *" className="border p-2 w-full rounded" onChange={e=>setForm({...form, telefono:e.target.value})} />
            <input placeholder="EMAIL" className="border p-2 w-full rounded" onChange={e=>setForm({...form, email:e.target.value})} />
            <button onClick={()=>onConfirm(form)} className="w-full bg-green-600 text-white font-bold py-2 rounded mt-2 shadow">CONFIRMAR</button>
            <button onClick={onClose} className="w-full text-xs text-gray-400 underline mt-1">Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}