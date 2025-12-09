"use client";

interface Props {
  isOpen: boolean;
  pendientes: number; // Cantidad de habitaciones que faltan configurar en el lote actual
  onSeguirCargando: () => void;
  onSiguienteHabitacion: () => void; // Nueva acción
  onGuardarYReiniciar: () => void;   // Vieja "Cargar Otra"
  onSalir: () => void;
}

export default function ModalOpciones({ 
    isOpen, 
    pendientes,
    onSeguirCargando, 
    onSiguienteHabitacion,
    onGuardarYReiniciar, 
    onSalir 
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in">
      <div className="bg-white w-[550px] shadow-2xl border border-gray-400 p-8 text-center rounded-lg relative">
        <h3 className="text-xl font-serif font-bold mb-2 text-gray-800">¿Qué desea hacer a continuación?</h3>
        {pendientes > 0 && (
            <p className="text-sm text-orange-600 font-bold mb-6">
                ⚠ Aún tiene {pendientes} habitación(es) seleccionada(s) sin configurar.
            </p>
        )}
        <div className="border-b mb-6 border-gray-200 w-full"></div>
        
        <div className="flex flex-col gap-4 px-4">
            {/* Opción 1: Seguir en la misma */}
            <button onClick={onSeguirCargando} className="bg-blue-100 border-2 border-blue-400 py-3 font-bold shadow-sm hover:bg-blue-200 rounded text-blue-900 transition flex items-center justify-center gap-2">
                <span>👥</span> SEGUIR AGREGANDO HUÉSPEDES
                <span className="text-xs font-normal">(En esta misma habitación)</span>
            </button>
            
            {/* Opción 2: Lógica condicional - Siguiente del lote O Guardar y Nueva */}
            {pendientes > 0 ? (
                <button onClick={onSiguienteHabitacion} className="bg-orange-100 border-2 border-orange-400 py-3 font-bold shadow-sm hover:bg-orange-200 rounded text-orange-900 transition flex items-center justify-center gap-2">
                    <span>➡</span> CONFIGURAR SIGUIENTE HABITACIÓN
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendientes}</span>
                </button>
            ) : (
                <button onClick={onGuardarYReiniciar} className="bg-cyan-50 border-2 border-cyan-400 py-3 font-bold shadow-sm hover:bg-cyan-100 rounded text-cyan-900 transition">
                    💾 FINALIZAR Y CARGAR OTRO CLIENTE
                </button>
            )}
            
            <div className="border-t my-2 border-gray-200 w-full"></div>

            {/* Opción 3: Salir */}
            <button onClick={onSalir} className="bg-red-50 border-2 border-red-600 py-3 font-bold shadow-sm hover:bg-red-100 text-red-800 rounded transition">
                {pendientes > 0 ? "💾 GUARDAR TODO Y SALIR" : "🚪 FINALIZAR Y SALIR"}
            </button>
        </div>
      </div>
    </div>
  );
}