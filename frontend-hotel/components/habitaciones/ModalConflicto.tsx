"use client";
import { useState, useEffect } from "react";
import { obtenerTitularConflicto } from "@/services/api";
// Iconos modernos
import { AlertTriangle, Calendar, User, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white p-8 w-[500px] shadow-2xl border-t-8 border-amber-400 relative text-center rounded-3xl">
        
        {/* ICONO ALERTA */}
        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertTriangle size={40} />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Conflicto de Reserva</h3>
        <p className="text-gray-500 mb-8 text-sm">Esta habitación ya tiene una reserva activa para la fecha seleccionada.</p>
        
        {/* TARJETA DETALLE */}
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-8 text-left shadow-sm">
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-amber-200/50">
              <div>
                  <p className="text-xs text-amber-600/80 font-bold uppercase tracking-wider mb-1">Reservado por</p>
                  <div className="flex items-center gap-2">
                      <User size={18} className="text-amber-600"/>
                      <p className="text-lg font-bold text-gray-900 uppercase">{info.titular}</p>
                  </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-700 shadow-sm">
                  HAB. {habitacionNumero}
              </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-700">
              <div className="bg-white px-4 py-2 rounded-xl border border-amber-100 shadow-sm flex items-center gap-2">
                 <Calendar size={14} className="text-gray-400"/>
                 <span className="font-mono font-bold text-gray-800">{info.desde}</span>
              </div>
              <ArrowRight size={16} className="text-amber-400"/>
              <div className="bg-white px-4 py-2 rounded-xl border border-amber-100 shadow-sm flex items-center gap-2">
                 <Calendar size={14} className="text-gray-400"/>
                 <span className="font-mono font-bold text-gray-800">{info.hasta}</span>
              </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6 font-medium">¿Desea ignorar esta reserva y registrar la ocupación igualmente?</p>

        {/* BOTONES */}
        <div className="flex gap-4 justify-center">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18}/> Volver
          </button>
          
          <button 
            onClick={() => onOcuparIgual(diasReserva)} 
            className="flex-1 py-3 bg-amber-400 text-amber-900 rounded-xl font-bold hover:bg-amber-500 shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <CheckCircle size={18}/> Ocupar Igual
          </button>
        </div>
      </div>
    </div>
  );
}