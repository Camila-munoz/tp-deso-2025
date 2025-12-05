"use client";
import { useState } from "react";
import { buscarHuespedes } from "@/services/api";

interface Props {
  isOpen: boolean;
  habitacionNumero: string;
  onAceptar: (titular: any, acompanantes: any[]) => void;
  onCancelar?: () => void;
}

export default function ModalCargaHuespedes({ isOpen, habitacionNumero, onAceptar, onCancelar }: Props) {
  const [filtros, setFiltros] = useState({ apellido: "", nombre: "", dni: "", tipoDoc: "DNI" });
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Mapa de seleccionados: ID -> { data: Huesped, rol: 'TITULAR'|'ACOMP' }
  const [seleccionados, setSeleccionados] = useState<Map<number, { data: any, rol: string }>>(new Map());

  if (!isOpen) return null;

  const handleBuscar = async () => {
    setBuscando(true); setResultados([]); setMensaje("");
    try {
      const res = await buscarHuespedes({ apellido: filtros.apellido, nombre: filtros.nombre, numDoc: filtros.dni, tipoDoc: filtros.tipoDoc });
      if (res.success && res.data.length > 0) setResultados(res.data);
      else setMensaje("No se encontraron resultados.");
    } catch (e) { setMensaje("Error de conexión."); } 
    finally { setBuscando(false); }
  };

  // Asignar rol (Punto 3)
  const setRol = (h: any, rol: 'TITULAR' | 'ACOMP') => {
    const newMap = new Map(seleccionados);
    
    if (rol === 'TITULAR') {
        // Solo 1 titular: desmarcamos al anterior
        newMap.forEach((val, key) => { if(val.rol === 'TITULAR') newMap.set(key, { ...val, rol: 'ACOMP' }); });
    }
    
    // Si ya tenía ese rol, lo deseleccionamos (toggle off)
    if (newMap.get(h.id)?.rol === rol) {
        newMap.delete(h.id);
    } else {
        newMap.set(h.id, { data: h, rol });
    }
    setSeleccionados(newMap);
  };

  const handleConfirmar = () => {
    const lista = Array.from(seleccionados.values());
    const titular = lista.find(x => x.rol === 'TITULAR')?.data;
    const acomp = lista.filter(x => x.rol === 'ACOMP').map(x => x.data);

    if (!titular) return alert("Debe seleccionar un TITULAR.");
    
    onAceptar(titular, acomp); // Enviamos todo junto al padre
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in">
      <div className="bg-gray-100 w-[900px] h-[800px] shadow-2xl border-2 border-gray-500 p-6 rounded flex flex-col">
        
        <h2 className="text-3xl text-center text-[#d32f2f] font-bold font-serif mb-4">
            HUÉSPEDES - Habitación {habitacionNumero}
        </h2>

        {/* BUSCADOR (Punto 2: Permite buscar varias veces sin cerrar) */}
        <div className="bg-[#e3f2fd] p-4 rounded border border-blue-200 mb-4">
            <div className="grid grid-cols-4 gap-2 mb-2">
                <input className="border p-1 rounded uppercase text-sm" placeholder="APELLIDO" onChange={e=>setFiltros({...filtros, apellido:e.target.value.toUpperCase()})}/>
                <input className="border p-1 rounded uppercase text-sm" placeholder="NOMBRE" onChange={e=>setFiltros({...filtros, nombre:e.target.value.toUpperCase()})}/>
                <select className="border p-1 rounded text-sm" onChange={e=>setFiltros({...filtros, tipoDoc:e.target.value})}>
                    <option>DNI</option>
                    <option>PASAPORTE</option>
                    <option>LE</option>
                    <option>LC</option>
                    <option>OTRO</option>
                </select>
                <input className="border p-1 rounded text-sm" placeholder="DOCUMENTO" onChange={e=>setFiltros({...filtros, dni:e.target.value})}/>
            </div>
            <button onClick={handleBuscar} className="w-full bg-white border border-blue-400 font-bold py-1 text-blue-800 hover:bg-blue-50">
                {buscando?"...":"BUSCAR"}
            </button>
        </div>

        {/* GRILLA RESULTADOS + SELECCIÓN (Punto 3) */}
        <div className="flex-1 bg-white border border-gray-400 overflow-y-auto shadow-inner">
            <table className="w-full text-center text-sm">
                <thead className="bg-gray-200 sticky top-0 z-10">
                    <tr><th>Apellido y Nombre</th><th>Documento</th><th className="w-64">Asignar Rol</th></tr>
                </thead>
                <tbody>
                    {resultados.map(h => {
                        const sel = seleccionados.get(h.id);
                        return (
                            <tr key={h.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-bold text-left pl-4">{h.apellido}, {h.nombre}</td>
                                <td className="p-2">{h.tipoDocumento} {h.numeroDocumento}</td>
                                <td className="p-2 flex justify-center gap-2">
                                    {/* BOTONES DE ROL */}
                                    <button 
                                        onClick={() => setRol(h, 'TITULAR')}
                                        className={`px-3 py-1 rounded border font-bold text-xs transition-all ${sel?.rol==='TITULAR' ? 'bg-blue-600 text-white border-blue-800 scale-105' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                    >
                                        {sel?.rol==='TITULAR' ? 'TITULAR' : 'ELEGIR TITULAR'}
                                    </button>
                                    <button 
                                        onClick={() => setRol(h, 'ACOMP')}
                                        className={`px-3 py-1 rounded border font-bold text-xs transition-all ${sel?.rol==='ACOMP' ? 'bg-cyan-500 text-white border-cyan-700 scale-105' : 'bg-white text-cyan-600 border-cyan-200 hover:bg-cyan-50'}`}
                                    >
                                        {sel?.rol==='ACOMP' ? 'ACOMPAÑANTE' : 'ELEGIR ACOMPAÑANTE'}
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {resultados.length===0 && <p className="text-center mt-10 text-gray-400 italic">{mensaje || "Ingrese datos para buscar..."}</p>}
        </div>

        {/* RESUMEN DE SELECCIÓN */}
        <div className="mt-4 p-3 bg-gray-50 border rounded min-h-[60px]">
            <p className="text-xs font-bold text-gray-500 mb-1">SELECCIONADOS:</p>
            <div className="flex flex-wrap gap-2">
                {Array.from(seleccionados.values()).map((item:any) => (
                    <span key={item.data.id} className={`px-2 py-1 rounded text-xs font-bold border ${item.rol==='TITULAR'?'bg-blue-100 text-blue-800 border-blue-300':'bg-cyan-50 text-cyan-800 border-cyan-200'}`}>
                        {item.rol}: {item.data.apellido}
                    </span>
                ))}
            </div>
        </div>

        <div className="text-center mt-4">
            <button onClick={handleConfirmar} className="bg-[#d4e157] border-2 border-yellow-600 px-12 py-3 font-bold shadow hover:bg-yellow-300 text-yellow-900 text-lg rounded">
                ACEPTAR SELECCIÓN
            </button>
        </div>
      </div>
    </div>
  );
}