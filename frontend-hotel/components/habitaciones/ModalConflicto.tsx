"use client";
import { useState, useEffect } from "react";
import { obtenerTitularConflicto } from "@/services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOcuparIgual: () => void;
  habitacionId: number;
  habitacionNumero: string;
  // Recibimos la fecha clickeada para buscar la reserva que la contiene
  fechaConsulta: string; 
}

export default function ModalConflicto({ isOpen, onClose, onOcuparIgual, habitacionId, habitacionNumero, fechaConsulta }: Props) {
  const [info, setInfo] = useState({ titular: "Cargando...", desde: "", hasta: "" });

  useEffect(() => {
    if (isOpen && habitacionId) {
      // El backend debe devolver quién ocupa esa fecha
      obtenerTitularConflicto(habitacionId, fechaConsulta)
        .then(res => setInfo(res))
        .catch(() => setInfo({ titular: "Error", desde: "?", hasta: "?" }));
    }
  }, [isOpen, habitacionId, fechaConsulta]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white p-8 w-[650px] shadow-2xl border-t-8 border-red-600 relative text-center rounded-lg">
        <h3 className="text-2xl font-serif font-bold text-red-800 mb-6">CONFLICTO DE RESERVA</h3>
        
        <div className="bg-yellow-50 p-6 rounded border border-yellow-200 mb-6 text-left">
          <p className="text-gray-800 font-bold text-lg mb-1">
            Del <span className="text-red-700">{info.desde}</span> al <span className="text-red-700">{info.hasta}</span>
          </p>
          <p className="text-gray-600 mb-3">
            La habitación <b>{habitacionNumero}</b> está reservada por:
          </p>
          <p className="text-2xl font-bold text-gray-900 uppercase border-t border-yellow-200 pt-2">
            {info.titular}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">¿Desea ignorar la reserva y registrar la ocupación de todas formas?</p>

        <div className="flex gap-6 justify-center">
          <button onClick={onOcuparIgual} className="bg-[#d4e157] border-2 border-yellow-600 px-8 py-3 font-bold shadow hover:bg-yellow-300 rounded text-yellow-900 transition">
            OCUPAR IGUAL
          </button>
          <button onClick={onClose} className="bg-[#ff5252] border-2 border-red-800 text-white px-8 py-3 font-bold shadow hover:bg-red-600 transition rounded">
            VOLVER
          </button>
        </div>
      </div>
    </div>
  );
}