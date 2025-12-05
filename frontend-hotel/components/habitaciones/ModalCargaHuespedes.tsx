"use client";
import { useState } from "react";
import { buscarHuespedes } from "@/services/api";

interface Props {
  isOpen: boolean;
  habitacionNumero: string;
  onAceptar: (titular: any, acompanantes: any[]) => void;
  onCancelar: () => void;
}

export default function ModalCargaHuespedes({ isOpen, habitacionNumero, onAceptar, onCancelar }: Props) {
  // Estados
  const [filtros, setFiltros] = useState({ apellido: "", nombre: "", dni: "", tipoDoc: "DNI" });
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  
  // Mapa de seleccionados
  const [seleccionados, setSeleccionados] = useState<Map<number, { data: any, rol: string }>>(new Map());

  if (!isOpen) return null;

  const handleBuscar = async () => {
    setBuscando(true); setResultados([]); setMensaje("");
    try {
      const res = await buscarHuespedes({ 
        apellido: filtros.apellido, 
        nombre: filtros.nombre, 
        numDoc: filtros.dni, 
        tipoDoc: filtros.tipoDoc 
      });
      if (res.success && res.data.length > 0) setResultados(res.data);
      else setMensaje("No se encontraron resultados.");
    } catch (e) { setMensaje("Error de conexión."); } 
    finally { setBuscando(false); }
  };

  const setRol = (h: any, rol: 'TITULAR' | 'ACOMPAÑANTE') => {
    const newMap = new Map(seleccionados);
    
    // Lógica toggle: Si ya tiene el rol, lo quita
    if (newMap.get(h.id)?.rol === rol) { 
        newMap.delete(h.id); 
    } else {
        // Si es titular, borramos al anterior (solo 1 titular)
        if (rol === 'TITULAR') {
            newMap.forEach((val, key) => { if(val.rol === 'TITULAR') newMap.set(key, { ...val, rol: 'ACOMPAÑANTE' }); });
        }
        newMap.set(h.id, { data: h, rol });
    }
    setSeleccionados(newMap);
  };

  const handleConfirmar = () => {
    const lista = Array.from(seleccionados.values());
    const titular = lista.find(x => x.rol === 'TITULAR')?.data;
    const acomp = lista.filter(x => x.rol === 'ACOMPAÑANTE').map(x => x.data);

    if (!titular) return alert("Debe seleccionar un TITULAR (Botón Verde).");
    onAceptar(titular, acomp);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in">
      <div className="bg-gray-100 w-[900px] h-[750px] shadow-2xl border-2 border-gray-400 p-6 rounded-lg flex flex-col relative">
        
        {/* HEADER: Título y X */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
            <div>
                <h2 className="text-2xl font-serif font-bold text-[#d32f2f]">GESTIONAR HUÉSPED</h2>
                <p className="text-sm text-gray-500">Habitación: <span className="font-bold text-black">{habitacionNumero}</span></p>
            </div>
            <button 
                onClick={onCancelar} 
                className="text-gray-400 font-bold text-3xl hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer"
                title="Cerrar"
            >
                ✕
            </button>
        </div>

        {/* BUSCADOR (Bien visible arriba) */}
        <div className="bg-[#b3e5fc] p-4 rounded border border-blue-300 mb-4 shadow-sm">
             <div className="grid grid-cols-4 gap-2 mb-3">
                <input 
                    className="border p-2 rounded uppercase text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="APELLIDO" 
                    onChange={e=>setFiltros({...filtros, apellido:e.target.value.toUpperCase()})}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <input 
                    className="border p-2 rounded uppercase text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="NOMBRE" 
                    onChange={e=>setFiltros({...filtros, nombre:e.target.value.toUpperCase()})}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <select className="border p-2 rounded text-sm bg-white" onChange={e=>setFiltros({...filtros, tipoDoc:e.target.value})}>
                    <option value="DNI">DNI</option>
                    <option value="PASAPORTE">PASAPORTE</option>
                    <option value="LE">LE</option>
                    <option value="LC">LC</option>
                    <option value="OTRO">OTRO</option>
                </select>
                <input 
                    className="border p-2 rounded text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="DOCUMENTO" 
                    onChange={e=>setFiltros({...filtros, dni:e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
             </div>
             <div className="text-center">
                 <button onClick={handleBuscar} disabled={buscando} className="bg-blue-600 text-white px-8 py-2 rounded font-bold shadow hover:bg-blue-700 transition-colors text-sm">
                     {buscando ? "BUSCANDO..." : "BUSCAR"}
                 </button>
             </div>
        </div>

        {/* GRILLA DE RESULTADOS */}
        <div className="flex-1 bg-white border border-gray-400 overflow-y-auto mb-4 rounded shadow-inner">
             <table className="w-full text-center text-sm border-collapse">
                <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="p-3 border-b border-r text-gray-700">Apellido y Nombre</th>
                        <th className="p-3 border-b border-r text-gray-700">Documento</th>
                        <th className="p-3 border-b w-48 text-gray-700">Asignar Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {resultados.map(h => {
                        const sel = seleccionados.get(h.id);
                        // Color de fila según selección
                        let rowClass = "hover:bg-gray-50";
                        if (sel?.rol === 'TITULAR') rowClass = "bg-green-100";
                        if (sel?.rol === 'ACOMPAÑANTE') rowClass = "bg-blue-50";

                        return (
                            <tr key={h.id} className={`border-b transition-colors ${rowClass}`}>
                                <td className="p-2 border-r text-left pl-4 font-medium">{h.apellido}, {h.nombre}</td>
                                <td className="p-2 border-r">{h.tipoDocumento} {h.numeroDocumento}</td>
                                <td className="p-2 flex justify-center gap-2">
                                    <button 
                                        onClick={()=>setRol(h, 'TITULAR')} 
                                        className={`px-3 py-1 text-xs font-bold rounded border transition-all ${sel?.rol==='TITULAR' ? 'bg-green-600 text-white border-green-700 shadow-inner' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                                    >
                                        TITULAR
                                    </button>
                                    <button 
                                        onClick={()=>setRol(h, 'ACOMPAÑANTE')} 
                                        className={`px-3 py-1 text-xs font-bold rounded border transition-all ${sel?.rol==='ACOMPAÑANTE' ? 'bg-blue-500 text-white border-blue-700 shadow-inner' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                                    >
                                        ACOMP.
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
             </table>
             
             {resultados.length === 0 && !buscando && (
                <div className="flex h-full items-center justify-center text-gray-400 italic">
                    {mensaje || "Ingrese criterios de búsqueda arriba para comenzar."}
                </div>
             )}
        </div>

        {/* FOOTER (Resumen y Confirmar) */}
        <div className="mt-auto p-3 bg-gray-50 border-t border-gray-300 rounded flex justify-between items-center">
            <div className="flex gap-2 overflow-x-auto max-w-[60%] pb-1">
                {Array.from(seleccionados.values()).length === 0 && <span className="text-xs text-gray-400 italic self-center">Ningún seleccionado...</span>}
                
                {Array.from(seleccionados.values()).map((item:any) => (
                    <span key={item.data.id} className={`px-2 py-1 rounded text-xs font-bold border shadow-sm whitespace-nowrap ${item.rol==='TITULAR'?'bg-green-200 text-green-900 border-green-400':'bg-blue-100 text-blue-800 border-blue-300'}`}>
                        {item.rol === 'TITULAR' ? '👑' : '👤'} {item.data.apellido}
                    </span>
                ))}
            </div>

            <button 
                onClick={handleConfirmar} 
                className="bg-[#d4e157] border-2 border-yellow-600 text-yellow-900 px-10 py-2 font-bold shadow-md hover:bg-yellow-300 transition-transform active:scale-95 rounded"
            >
                ACEPTAR SELECCIÓN
            </button>
        </div>

      </div>
    </div>
  );
}