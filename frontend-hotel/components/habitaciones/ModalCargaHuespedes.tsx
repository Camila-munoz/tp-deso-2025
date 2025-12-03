"use client";
import { useState } from "react";
import HuespedSelector from "@/components/shared/HuespedSelector";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (titularId: number, acompanantesIds: number[], dias: number) => void;
  habitacionNumero: string;
}

export default function ModalCargaHuespedes({ isOpen, onClose, onConfirm, habitacionNumero }: Props) {
  const [titular, setTitular] = useState<any>(null);
  const [acompanantes, setAcompanantes] = useState<any[]>([]);
  const [dias, setDias] = useState(1);
  
  // Estado para mostrar el menú de opciones (Paso 10 del CU)
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  if (!isOpen) return null;

  // Lógica para agregar persona desde el Selector
  const handleSeleccionar = (persona: any) => {
    if (!titular) {
      setTitular(persona);
      // Según flujo, tras seleccionar, mostramos opciones
      setMostrarOpciones(true);
    } else {
      // Si ya hay titular, es un acompañante
      if (persona.id !== titular.id && !acompanantes.find(a => a.id === persona.id)) {
        setAcompanantes([...acompanantes, persona]);
        setMostrarOpciones(true);
      } else {
        alert("Esta persona ya está seleccionada.");
      }
    }
  };

  // Botón "SEGUIR CARGANDO" (Paso 11.A)
  const handleSeguirCargando = () => {
    setMostrarOpciones(false); // Oculta menú, vuelve al buscador
  };

  // Botón "SALIR" (Confirmar) (Paso 11)
  const handleSalir = () => {
    if (!titular) return alert("Falta el titular.");
    onConfirm(titular.id, acompanantes.map(a => a.id), dias);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in duration-200">
      <div className="bg-white w-[800px] shadow-2xl border-t-8 border-red-600 rounded relative min-h-[500px] flex flex-col">
        
        {/* HEADER */}
        <button onClick={onClose} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 font-bold hover:bg-red-700 z-10">X</button>
        <div className="text-center p-4 border-b bg-gray-50">
          <h2 className="text-2xl font-serif font-bold text-red-800 uppercase tracking-widest">Gestionar Huésped</h2>
          <p className="text-sm text-gray-500">Habitación {habitacionNumero}</p>
        </div>

        <div className="p-8 flex-1 flex flex-col gap-6">
            
            {/* 1. BUSCADOR (Reutilizamos tu selector existente) */}
            <div className={`${mostrarOpciones ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                <label className="font-bold text-gray-700 block mb-2">Buscar en Padrón:</label>
                <HuespedSelector onSeleccionar={handleSeleccionar} />
            </div>

            {/* 2. LISTA DE SELECCIONADOS (La "Grilla" del Mockup 3) */}
            <div className="border-2 border-blue-200 rounded overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-blue-100 text-blue-900">
                        <tr>
                            <th className="p-2">Rol</th>
                            <th className="p-2">Apellido y Nombre</th>
                            <th className="p-2">Documento</th>
                            <th className="p-2 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {titular && (
                            <tr className="bg-green-50 border-b">
                                <td className="p-2 font-bold text-green-700">TITULAR</td>
                                <td className="p-2 font-bold">{titular.apellido}, {titular.nombre}</td>
                                <td className="p-2">{titular.numeroDocumento}</td>
                                <td className="p-2 text-center"><button onClick={()=>{setTitular(null); setMostrarOpciones(false)}} className="text-red-500 font-bold">X</button></td>
                            </tr>
                        )}
                        {acompanantes.map(a => (
                            <tr key={a.id} className="border-b">
                                <td className="p-2 text-gray-500">Acompañante</td>
                                <td className="p-2">{a.apellido}, {a.nombre}</td>
                                <td className="p-2">{a.numeroDocumento}</td>
                                <td className="p-2 text-center"><button onClick={()=>setAcompanantes(acompanantes.filter(p=>p.id!==a.id))} className="text-red-500 font-bold">X</button></td>
                            </tr>
                        ))}
                        {!titular && (
                            <tr><td colSpan={4} className="p-4 text-center text-gray-400 italic">No hay personas seleccionadas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* CAMPO DE DÍAS (Extra necesario para crear estadía) */}
            <div className="flex justify-end items-center gap-2">
                <label className="font-bold text-gray-700">Días de Estadía:</label>
                <input type="number" min="1" value={dias} onChange={e=>setDias(parseInt(e.target.value))} className="border p-2 w-20 text-center font-bold rounded"/>
            </div>
        </div>

        {/* --- MENÚ DE OPCIONES FLOTANTE (Paso 10 - Mockup 3) --- */}
        {mostrarOpciones && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
                <div className="bg-white p-6 rounded-lg shadow-2xl border border-gray-400 w-80 text-center animate-in zoom-in duration-150">
                    <h3 className="font-serif font-bold text-lg mb-4 text-gray-800 border-b pb-2">Seleccione una opción:</h3>
                    
                    <div className="flex flex-col gap-3">
                        <button onClick={handleSeguirCargando} className="bg-[#b3e5fc] border border-blue-400 text-blue-900 py-2 rounded font-bold hover:bg-blue-200">
                            Seguir cargando
                        </button>
                        <button onClick={onClose} className="bg-[#b2dfdb] border border-teal-400 text-teal-900 py-2 rounded font-bold hover:bg-teal-200">
                            Cargar otra habitación
                        </button>
                        <button onClick={handleSalir} className="bg-[#ff5252] border border-red-800 text-white py-2 rounded font-bold hover:bg-red-600 shadow-md">
                            Salir (Confirmar)
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Botón ACEPTAR inicial (Si no hay menú, para cerrar sin confirmar o forzar menú) */}
        {!mostrarOpciones && (
            <div className="p-4 bg-gray-100 text-center border-t">
                 <button onClick={onClose} className="bg-gray-300 text-gray-700 px-8 py-2 rounded font-bold hover:bg-gray-400">CANCELAR</button>
            </div>
        )}

      </div>
    </div>
  );
}