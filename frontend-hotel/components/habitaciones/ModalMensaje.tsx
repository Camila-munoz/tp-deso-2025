"use client";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  tipo?: "ERROR" | "EXITO" | "INFO";
  onClose: () => void;
}

export default function ModalMensaje({ isOpen, titulo, mensaje, tipo = "INFO", onClose }: Props) {
  if (!isOpen) return null;

  // Configuración de estilos según el tipo
  const config = {
    ERROR: { 
        icon: XCircle, 
        colorText: "text-rose-600", 
        bgIcon: "bg-rose-100", 
        btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-200" 
    },
    EXITO: { 
        icon: CheckCircle, 
        colorText: "text-emerald-600", 
        bgIcon: "bg-emerald-100", 
        btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" 
    },
    INFO: { 
        icon: Info, 
        colorText: "text-indigo-600", 
        bgIcon: "bg-indigo-100", 
        btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" 
    }
  }[tipo];

  const Icono = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-[450px] text-center border border-gray-100 relative transform transition-all scale-100">
        
        {/* Botón Cerrar "X" */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
        >
            <X size={20}/>
        </button>

        {/* Icono Central */}
        <div className={`w-20 h-20 ${config.bgIcon} ${config.colorText} rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm`}>
            <Icono size={40} strokeWidth={2} />
        </div>

        {/* Contenido */}
        <h2 className={`text-2xl font-bold ${config.colorText} mb-3`}>{titulo}</h2>
        <p className="text-gray-500 text-base mb-8 leading-relaxed font-medium px-2">{mensaje}</p>
        
        {/* Botón Aceptar */}
        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${config.btn}`}
        >
          ACEPTAR
        </button>
      </div>
    </div>
  );
}