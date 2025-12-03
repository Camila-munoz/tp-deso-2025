"use client";
import { useState } from "react";
import HuespedSelector from "@/components/shared/HuespedSelector";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datos: any) => void;
  habitacionNumero: string;
  estadoActual: string;
  // Hacemos opcionales las fechas para flexibilidad
  fechaInicio?: string;
  fechaFin?: string;
  diasDefault?: number;
}

export default function ModalOcupar({ isOpen, onClose, onConfirm, habitacionNumero, estadoActual, diasDefault = 1, fechaInicio, fechaFin }: Props) {
  const [paso, setPaso] = useState<"AVISO" | "CARGA">("AVISO");
  
  // Calcular días iniciales si vienen fechas
  const calcDias = () => {
     if(fechaInicio && fechaFin) {
        const diff = Math.ceil(Math.abs(new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000);
        return diff > 0 ? diff : 1;
     }
     return diasDefault;
  };

  const [dias, setDias] = useState(calcDias());
  const [titular, setTitular] = useState<any>(null);
  const [acompanantes, setAcompanantes] = useState<any[]>([]);

  if (!isOpen) return null;
  if (paso === "AVISO" && estadoActual !== "RESERVADA") setPaso("CARGA");

  const handleFinalizar = () => {
    if (!titular) return alert("Debe seleccionar un titular.");
    onConfirm({
        idHuespedTitular: titular.id,
        idsAcompañantes: acompanantes.map(a => a.id),
        dias: dias
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[550px] border-t-8 border-red-600 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-xl text-red-800 mb-4 border-b pb-2">🛎️ Ocupar Habitación {habitacionNumero}</h3>

        {paso === "AVISO" && estadoActual === "RESERVADA" && (
            <div className="text-center py-6 space-y-4">
                <p className="font-bold text-gray-700 text-lg">⚠️ Habitación RESERVADA</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-4 py-2 border rounded">VOLVER</button>
                    <button onClick={() => setPaso("CARGA")} className="px-4 py-2 bg-red-600 text-white font-bold rounded shadow">OCUPAR IGUAL</button>
                </div>
            </div>
        )}

        {paso === "CARGA" && (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <p className="text-xs text-green-800 font-bold mb-2">PERSONAS ASIGNADAS:</p>
                    {titular ? (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center font-bold text-sm text-green-900 bg-white p-2 rounded border">
                                <span>👤 {titular.apellido}, {titular.nombre} (Titular)</span>
                                <button onClick={()=>setTitular(null)} className="text-red-500 text-xs font-bold">X</button>
                            </div>
                            {acompanantes.map(a => (
                                <div key={a.id} className="flex justify-between items-center text-sm text-gray-600 pl-4 border-l-2">
                                    <span>↳ {a.apellido}, {a.nombre}</span>
                                    <button onClick={()=>setAcompanantes(acompanantes.filter(p=>p.id!==a.id))} className="text-red-500 text-xs">X</button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400 text-sm italic">Ninguna. Use el buscador abajo.</p>}
                </div>

                <HuespedSelector onSeleccionar={(h) => !titular ? setTitular(h) : (h.id !== titular.id && !acompanantes.find(a=>a.id===h.id) && setAcompanantes([...acompanantes,h]))} />

                <div className="flex items-center justify-end gap-2 border-t pt-4">
                    <label className="font-bold">Días:</label>
                    <input type="number" min="1" value={dias} onChange={e => setDias(parseInt(e.target.value))} className="border p-2 w-20 text-center font-bold rounded" />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500">Cancelar</button>
                    <button onClick={handleFinalizar} disabled={!titular} className={`px-6 py-2 rounded font-bold shadow ${titular ? 'bg-red-600 text-white' : 'bg-gray-300'}`}>
                        SALIR (CONFIRMAR)
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}