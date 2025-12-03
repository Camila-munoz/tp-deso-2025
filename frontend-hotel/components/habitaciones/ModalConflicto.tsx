"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOcuparIgual: () => void;
  habitacionNumero: string;
  fecha: string;
}

export default function ModalConflicto({ isOpen, onClose, onOcuparIgual, habitacionNumero, fecha }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-8 w-[600px] shadow-2xl relative border-t-8 border-red-600">
        <button onClick={onClose} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 font-bold hover:bg-red-700">X</button>
        
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-serif font-bold text-red-800">CONFLICTO DE RESERVA</h2>
          
          <div className="bg-gray-100 p-6 rounded border border-gray-300 shadow-inner">
            <p className="text-lg text-gray-700 mb-2">
              El día <b>{fecha}</b> la habitación <b>{habitacionNumero}</b> figura como:
            </p>
            <p className="text-2xl font-bold text-yellow-600 uppercase tracking-wider">RESERVADA</p>
            {/* Nota: Para mostrar el nombre del que reservó, el backend debería devolverlo en la grilla. 
                Por ahora mostramos el estado genérico según tu API actual. */}
          </div>

          <p className="text-sm text-gray-500">
            ¿Desea ignorar la reserva y registrar la ocupación de todas formas?
          </p>

          <div className="flex justify-center gap-6 mt-4">
            <button 
              onClick={onOcuparIgual} 
              className="bg-[#d4e157] border-2 border-yellow-600 text-yellow-900 px-8 py-3 font-bold shadow hover:bg-yellow-300 transition w-48"
            >
              OCUPAR IGUAL
            </button>
            <button 
              onClick={onClose} 
              className="bg-[#ff5252] border-2 border-red-800 text-white px-8 py-3 font-bold shadow hover:bg-red-600 transition w-48"
            >
              VOLVER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}