"use client";
import { useState, useEffect } from "react";
import { buscarHuespedes } from "@/services/api";

interface Props {
  isOpen: boolean;
  habitacionNumero: string;
  onAceptar: (titular: any, acompanantes: any[]) => void;
  onCancelar: () => void;
  onBack?: () => void;
  datosPrevios?: { titular: any; acomp: any[] } | null;
  // Nuevas props para lógica de negocio
  idsTitularesOcupados: Set<number>;
  idsAcompanantesOcupados: Set<number>;
}

export default function ModalCargaHuespedes({ 
    isOpen, 
    habitacionNumero, 
    onAceptar, 
    onCancelar, 
    datosPrevios,
    idsTitularesOcupados,
    idsAcompanantesOcupados
}: Props) {
  
  const [filtros, setFiltros] = useState({ apellido: "", nombre: "", dni: "", tipoDoc: "DNI" });
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [seleccionados, setSeleccionados] = useState<Map<number, { data: any, rol: string }>>(new Map());

  useEffect(() => {
    if (isOpen) {
        const nuevoMapa = new Map<number, { data: any, rol: string }>();
        if (datosPrevios) {
            if (datosPrevios.titular) nuevoMapa.set(datosPrevios.titular.id, { data: datosPrevios.titular, rol: 'TITULAR' });
            if (datosPrevios.acomp) datosPrevios.acomp.forEach((h) => nuevoMapa.set(h.id, { data: h, rol: 'ACOMPAÑANTE' }));
        }
        setSeleccionados(nuevoMapa);
        setResultados([]);
        setFiltros({ apellido: "", nombre: "", dni: "", tipoDoc: "DNI" });
        setMensaje("");
    }
  }, [isOpen, datosPrevios]);

  if (!isOpen) return null;

  const handleBuscar = async () => {
    setBuscando(true); setResultados([]); setMensaje("");
    try {
      const res = await buscarHuespedes({ 
        apellido: filtros.apellido, nombre: filtros.nombre, numDoc: filtros.dni, tipoDoc: filtros.tipoDoc 
      });
      if (res.success && res.data.length > 0) setResultados(res.data);
      else setMensaje("No se encontraron resultados.");
    } catch (e) { setMensaje("Error de conexión."); } 
    finally { setBuscando(false); }
  };

  const setRol = (h: any, rol: 'TITULAR' | 'ACOMPAÑANTE') => {
    const newMap = new Map(seleccionados);
    if (newMap.get(h.id)?.rol === rol) { 
        newMap.delete(h.id); 
    } else {
        if (rol === 'TITULAR') {
            newMap.forEach((val, key) => { if(val.rol === 'TITULAR') newMap.delete(key); });
        }
        newMap.set(h.id, { data: h, rol });
    }
    setSeleccionados(newMap);
  };

  const handleConfirmar = () => {
    const lista = Array.from(seleccionados.values());
    const titular = lista.find(x => x.rol === 'TITULAR')?.data;
    const acomp = lista.filter(x => x.rol === 'ACOMPAÑANTE').map(x => x.data);
    if (!titular) return alert("Debe seleccionar un TITULAR (Botón Verde) obligatorio.");
    onAceptar(titular, acomp);
  };

  // Lógica de Renderizado condicional de botones según REGLA DE NEGOCIO
  const renderBotonesRol = (h: any) => {
    const sel = seleccionados.get(h.id);
    
    // 1. REGLA: Si ya es Acompañante en otra habitación, NO PUEDE SER NADA AQUÍ.
    if (idsAcompanantesOcupados.has(h.id)) {
        return <span className="text-xs text-red-500 font-bold px-2">Ya asignado como Acompañante</span>;
    }

    // 2. REGLA: Si ya es Titular en otra habitación, PUEDE ser Titular aquí, pero NO Acompañante
    // (Interpretación: Acompañante implica ocupación física única. Titular implica responsabilidad financiera múltiple)
    const esTitularEnOtra = idsTitularesOcupados.has(h.id);

    return (
        <div className="flex justify-center gap-2">
            <button 
                onClick={()=>setRol(h, 'TITULAR')} 
                className={`px-3 py-1 text-xs font-bold rounded border transition-all ${sel?.rol==='TITULAR' ? 'bg-green-600 text-white border-green-700 shadow-inner scale-105' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
            >
                {esTitularEnOtra ? "TITULAR (Otra vez)" : "TITULAR"}
            </button>
            
            <button 
                onClick={()=>setRol(h, 'ACOMPAÑANTE')} 
                disabled={esTitularEnOtra} // BLOQUEO
                className={`px-3 py-1 text-xs font-bold rounded border transition-all 
                    ${esTitularEnOtra 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : sel?.rol==='ACOMPAÑANTE' 
                            ? 'bg-blue-500 text-white border-blue-700 shadow-inner scale-105' 
                            : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                title={esTitularEnOtra ? "No puede ser acompañante si ya es Titular en otra habitación" : ""}
            >
                ACOMP.
            </button>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in">
      <div className="bg-gray-100 w-[900px] h-[750px] shadow-2xl border-2 border-gray-400 p-6 rounded-lg flex flex-col relative">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
            <div>
                <h2 className="text-2xl font-serif font-bold text-[#d32f2f]">GESTIONAR HUÉSPED</h2>
                <p className="text-sm text-gray-500">Habitación: <span className="font-bold text-black">{habitacionNumero}</span></p>
            </div>
            <button onClick={onCancelar} className="text-gray-400 font-bold text-3xl hover:text-red-600 transition-colors">✕</button>
        </div>

        <div className="bg-[#b3e5fc] p-4 rounded border border-blue-300 mb-4 shadow-sm">
             <div className="grid grid-cols-4 gap-2 mb-3">
                <input className="border p-2 rounded uppercase text-sm outline-none" placeholder="APELLIDO" value={filtros.apellido} onChange={e=>setFiltros({...filtros, apellido:e.target.value.toUpperCase()})} onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}/>
                <input className="border p-2 rounded uppercase text-sm outline-none" placeholder="NOMBRE" value={filtros.nombre} onChange={e=>setFiltros({...filtros, nombre:e.target.value.toUpperCase()})} onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}/>
                <select className="border p-2 rounded text-sm bg-white" value={filtros.tipoDoc} onChange={e=>setFiltros({...filtros, tipoDoc:e.target.value})}>
                    <option value="DNI">DNI</option><option value="PASAPORTE">PASAPORTE</option><option value="LE">LE</option><option value="LC">LC</option><option value="OTRO">OTRO</option>
                </select>
                <input className="border p-2 rounded text-sm outline-none" placeholder="DOCUMENTO" value={filtros.dni} onChange={e=>setFiltros({...filtros, dni:e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}/>
             </div>
             <div className="text-center">
                 <button onClick={handleBuscar} disabled={buscando} className="bg-blue-600 text-white px-8 py-2 rounded font-bold shadow hover:bg-blue-700 transition-colors text-sm">
                     {buscando ? "BUSCANDO..." : "BUSCAR EN PADRÓN"}
                 </button>
             </div>
        </div>

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
                        let rowClass = "hover:bg-gray-50";
                        if (sel?.rol === 'TITULAR') rowClass = "bg-green-100";
                        if (sel?.rol === 'ACOMPAÑANTE') rowClass = "bg-blue-50";

                        return (
                            <tr key={h.id} className={`border-b transition-colors ${rowClass}`}>
                                <td className="p-2 border-r text-left pl-4 font-medium">{h.apellido}, {h.nombre}</td>
                                <td className="p-2 border-r">{h.tipoDocumento} {h.numeroDocumento}</td>
                                <td className="p-2">
                                    {renderBotonesRol(h)}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
             </table>
             {resultados.length === 0 && !buscando && (
                <div className="flex h-full items-center justify-center text-gray-400 italic flex-col gap-2"><span className="text-2xl">🔍</span><span>{mensaje || "Busque un huésped para comenzar."}</span></div>
             )}
        </div>

        <div className="mt-auto p-3 bg-gray-50 border-t border-gray-300 rounded flex justify-between items-center h-20">
            <div className="flex gap-2 overflow-x-auto max-w-[65%] pb-1 scrollbar-thin">
                {Array.from(seleccionados.values()).length === 0 && <span className="text-xs text-gray-400 italic self-center">Ningún huésped seleccionado...</span>}
                {Array.from(seleccionados.values()).map((item:any) => (
                    <div key={item.data.id} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border shadow-sm whitespace-nowrap ${item.rol==='TITULAR'?'bg-green-200 text-green-900 border-green-400':'bg-blue-100 text-blue-800 border-blue-300'}`}>
                        <span>{item.rol === 'TITULAR' ? '👑' : '👤'}</span><span className="truncate max-w-[100px]">{item.data.apellido}</span>
                        <button onClick={()=> { const m = new Map(seleccionados); m.delete(item.data.id); setSeleccionados(m); }} className="ml-1 text-red-500 hover:text-red-700 font-black">×</button>
                    </div>
                ))}
            </div>
            <button onClick={handleConfirmar} className="bg-[#d4e157] border-2 border-yellow-600 text-yellow-900 px-6 py-3 font-bold shadow-md hover:bg-yellow-300 transition-transform active:scale-95 rounded flex items-center gap-2">
                <span>ACEPTAR SELECCIÓN</span>
                <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">{seleccionados.size}</span>
            </button>
        </div>
      </div>
    </div>
  );
}