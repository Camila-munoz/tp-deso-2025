"use client";

interface Props {
  isOpen: boolean;
  onSeguirCargando: () => void;
  onCargarOtra: () => void;
  onSalir: () => void;
}

export default function ModalOpciones({ isOpen, onSeguirCargando, onCargarOtra, onSalir }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in">
      <div className="bg-white w-[500px] shadow-2xl border border-gray-400 p-8 text-center rounded-lg relative">
        <h3 className="text-xl font-serif font-bold mb-8 text-gray-800 border-b pb-4">Seleccione una opción:</h3>
        
        <div className="flex flex-col gap-4 px-8">
            <button onClick={onSeguirCargando} className="bg-[#90caf9] border-2 border-blue-400 py-3 font-bold shadow-md hover:brightness-95 rounded text-blue-900 transition">
                SEGUIR CARGANDO
            </button>
            
            <button onClick={onCargarOtra} className="bg-[#e0f7fa] border-2 border-cyan-400 py-3 font-bold shadow-md hover:brightness-95 rounded text-cyan-900 transition">
                CARGAR OTRA HABITACIÓN
            </button>
            
            <button onClick={onSalir} className="bg-[#ff5252] border-2 border-red-700 py-3 font-bold shadow-md hover:brightness-95 text-white rounded transition">
                SALIR (Confirmar)
            </button>
        </div>
      </div>
    </div>
  );
}