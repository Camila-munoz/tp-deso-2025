"use client";
// Iconos modernos
import { UserPlus, ArrowRight, Save, LogOut, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  pendientes: number; // Cantidad de habitaciones que faltan configurar en el lote actual
  onSeguirCargando: () => void;
  onSiguienteHabitacion: () => void; // Nueva acción
  onGuardarYReiniciar: () => void;   // Vieja "Cargar Otra"
  onSalir: () => void;
  onClose: () => void; // NUEVA PROP para cerrar
}

export default function ModalOpciones({ 
    isOpen, 
    pendientes,
    onSeguirCargando, 
    onSiguienteHabitacion,
    onGuardarYReiniciar, 
    onSalir,
    onClose 
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in-95 duration-200">
      <div className="bg-white w-[550px] shadow-2xl border border-gray-100 p-8 text-center rounded-3xl relative overflow-hidden">
        
        {/* BOTÓN CERRAR (CRUZ) */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
            title="Cerrar y volver a la grilla"
        >
            <X size={24} />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Qué desea hacer a continuación?</h3>
        
        {pendientes > 0 && (
            <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-xl mb-6 text-sm font-medium border border-amber-100 inline-block">
                ⚠️ Aún tiene <span className="font-bold">{pendientes}</span> habitación(es) seleccionada(s) sin configurar.
            </div>
        )}
        
        {!pendientes && <p className="text-gray-500 mb-6">La configuración de esta habitación ha finalizado.</p>}

        <div className="border-b mb-6 border-gray-100 w-full"></div>
        
        <div className="flex flex-col gap-3 px-4">
            {/* Opción 1: Seguir en la misma */}
            <button 
                onClick={onSeguirCargando} 
                className="bg-indigo-50 border border-indigo-100 py-4 rounded-2xl font-bold text-indigo-700 hover:bg-indigo-100 transition-all flex items-center justify-center gap-3 group"
            >
                <UserPlus size={20} className="group-hover:scale-110 transition-transform"/>
                <div className="flex flex-col items-start text-left">
                    <span>SEGUIR AGREGANDO HUÉSPEDES</span>
                    <span className="text-xs font-normal opacity-70">(En esta misma habitación)</span>
                </div>
            </button>
            
            {/* Opción 2: Lógica condicional - Siguiente del lote O Guardar y Nueva */}
            {pendientes > 0 ? (
                <button 
                    onClick={onSiguienteHabitacion} 
                    className="bg-amber-50 border border-amber-200 py-4 rounded-2xl font-bold text-amber-800 hover:bg-amber-100 transition-all flex items-center justify-center gap-3 shadow-sm group"
                >
                    <div className="flex items-center gap-2">
                        CONFIGURAR SIGUIENTE HABITACIÓN
                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">{pendientes}</span>
                    </div>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            ) : (
                <button 
                    onClick={onGuardarYReiniciar} 
                    className="bg-emerald-50 border border-emerald-200 py-4 rounded-2xl font-bold text-emerald-800 hover:bg-emerald-100 transition-all flex items-center justify-center gap-3 shadow-sm group"
                >
                    <Save size={20} className="group-hover:scale-110 transition-transform"/>
                    FINALIZAR Y CARGAR OTRO CLIENTE
                </button>
            )}
            
            <div className="h-px bg-gray-100 w-full my-2"></div>

            {/* Opción 3: Salir */}
            <button 
                onClick={onSalir} 
                className="bg-white border border-gray-200 py-3 rounded-2xl font-bold text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
                <LogOut size={18}/>
                {pendientes > 0 ? "GUARDAR PARCIAL Y SALIR" : "FINALIZAR Y SALIR"}
            </button>
        </div>
      </div>
    </div>
  );
}