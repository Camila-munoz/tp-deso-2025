"use client";
import { useState, useEffect } from "react";
import { obtenerTitularConflicto } from "@/services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOcuparIgual: (dias: number) => void;
  habitacionId: number;
  habitacionNumero: string;
  fecha: string;
}

export default function ModalConflicto({ isOpen, onClose, onOcuparIgual, habitacionId, habitacionNumero, fecha }: Props) {
  const [info, setInfo] = useState({ titular: "Cargando...", desde: "...", hasta: "..." });
  const [diasReserva, setDiasReserva] = useState(1);

  useEffect(() => {
    if (isOpen && habitacionId && fecha) {
      setInfo({ titular: "Buscando...", desde: "...", hasta: "..." });
      
      obtenerTitularConflicto(habitacionId, fecha)
        .then(res => {
            setInfo(res);
            // Calcular días para pasarlos al ocupar
            if (res.desde && res.hasta && res.desde !== "--") {
                const d1 = new Date(res.desde);
                const d2 = new Date(res.hasta);
                const diff = Math.ceil((d2.getTime() - d1.getTime()) / 86400000);
                setDiasReserva(diff > 0 ? diff : 1);
            }
        })
        .catch(() => setInfo({ titular: "Error de conexión", desde: "?", hasta: "?" }));
    }
  }, [isOpen, habitacionId, fecha]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white p-8 w-[600px] shadow-2xl border-t-8 border-red-600 relative text-center rounded-lg">
        
        <h3 className="text-2xl font-serif font-bold text-red-800 mb-6">CONFLICTO DE RESERVA</h3>
        
        <div className="bg-yellow-50 p-6 rounded border border-yellow-200 mb-6 text-left shadow-inner">
          <p className="text-gray-600 mb-2 text-sm font-bold uppercase tracking-wide">Detalles del conflicto:</p>
          
          <div className="mb-4">
              <p className="text-xs text-gray-500">Habitación {habitacionNumero}</p>
              <p className="text-xl font-bold text-gray-900 uppercase border-b border-yellow-300 pb-1 inline-block">
                {info.titular}
              </p>
          </div>
          
          <div className="flex gap-8 text-sm text-gray-700 bg-white p-3 rounded border border-yellow-100">
             <div>
                <span className="block text-xs text-gray-400 font-bold">DESDE</span>
                <span className="font-mono font-bold">{info.desde}</span>
             </div>
             <div>
                <span className="block text-xs text-gray-400 font-bold">HASTA</span>
                <span className="font-mono font-bold">{info.hasta}</span>
             </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6 font-medium">¿Desea ignorar esta reserva y registrar la ocupación?</p>

        <div className="flex gap-4 justify-center">
          <button onClick={() => onOcuparIgual(diasReserva)} className="bg-[#d4e157] border-2 border-yellow-600 px-6 py-3 font-bold shadow hover:bg-yellow-300 rounded text-yellow-900 w-40">
            OCUPAR IGUAL
          </button>
          <button onClick={onClose} className="bg-[#ff5252] border-2 border-red-800 text-white px-6 py-3 font-bold shadow hover:bg-red-600 rounded w-40">
            VOLVER
          </button>
        </div>
      </div>
    </div>
  );
}