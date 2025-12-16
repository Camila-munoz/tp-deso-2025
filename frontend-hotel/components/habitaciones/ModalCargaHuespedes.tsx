"use client";
import { useState, useEffect } from "react";
import { buscarHuespedes } from "@/services/api";
// Iconos modernos
import { Search, X, Check, AlertCircle, User, Crown, Loader2, Info } from "lucide-react";

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
    if (!titular) return alert("Debe seleccionar un TITULAR obligatorio.");
    onAceptar(titular, acomp);
  };

  // Lógica de Renderizado condicional de botones según REGLA DE NEGOCIO
  const renderBotonesRol = (h: any) => {
    const sel = seleccionados.get(h.id);
    
    // 1. REGLA: Si ya es Acompañante en otra habitación, NO PUEDE SER NADA AQUÍ.
    if (idsAcompanantesOcupados.has(h.id)) {
        return (
            <div className="flex items-center justify-center gap-1 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100">
                <AlertCircle size={14} />
                <span className="text-xs font-bold">Ya asignado (Acomp.)</span>
            </div>
        );
    }

    // 2. REGLA: Si ya es Titular en otra habitación, PUEDE ser Titular aquí, pero NO Acompañante
    const esTitularEnOtra = idsTitularesOcupados.has(h.id);

    return (
        <div className="flex justify-center gap-2">
            <button 
                onClick={()=>setRol(h, 'TITULAR')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    sel?.rol==='TITULAR' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' 
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
            >
                {esTitularEnOtra ? "TITULAR (Repite)" : "TITULAR"}
            </button>
            
            <button 
                onClick={()=>setRol(h, 'ACOMPAÑANTE')} 
                disabled={esTitularEnOtra} // BLOQUEO
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all 
                    ${esTitularEnOtra 
                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60' 
                        : sel?.rol==='ACOMPAÑANTE' 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                            : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                    }`}
                title={esTitularEnOtra ? "No puede ser acompañante si ya es Titular en otra habitación" : ""}
            >
                ACOMPAÑANTE
            </button>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in-95 duration-200">
      <div className="bg-white w-[900px] h-[80vh] shadow-2xl border border-gray-100 rounded-3xl flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestionar Huéspedes</h2>
                <p className="text-sm text-gray-500 mt-0.5">Habitación <span className="font-bold text-indigo-600 text-base">#{habitacionNumero}</span></p>
            </div>
            <button onClick={onCancelar} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* BODY: BUSCADOR + TABLA */}
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Buscador */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 shrink-0">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[120px]">
                        <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder-gray-400 transition-all" placeholder="APELLIDO" value={filtros.apellido} onChange={e=>setFiltros({...filtros, apellido:e.target.value.toUpperCase()})} onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}/>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder-gray-400 transition-all" placeholder="NOMBRE" value={filtros.nombre} onChange={e=>setFiltros({...filtros, nombre:e.target.value.toUpperCase()})} onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}/>
                    </div>
                    <div className="w-[100px]">
                        <select className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={filtros.tipoDoc} onChange={e=>setFiltros({...filtros, tipoDoc:e.target.value})}>
                            <option value="DNI">DNI</option><option value="PASAPORTE">PASS</option><option value="LE">LE</option><option value="LC">LC</option>
                        </select>
                    </div>
                    <div className="w-[140px]">
                        <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400" placeholder="DOCUMENTO" value={filtros.dni} onChange={e=>setFiltros({...filtros, dni:e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}/>
                    </div>
                    <button onClick={handleBuscar} disabled={buscando} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all text-sm flex items-center gap-2">
                        {buscando ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
                        BUSCAR
                    </button>
                 </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="flex-1 overflow-y-auto p-6 bg-white relative">
                 <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Huésped</th>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Documento</th>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">Asignar Rol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {resultados.map(h => {
                                const sel = seleccionados.get(h.id);
                                let rowClass = "hover:bg-gray-50";
                                if (sel?.rol === 'TITULAR') rowClass = "bg-emerald-50/60";
                                if (sel?.rol === 'ACOMPAÑANTE') rowClass = "bg-indigo-50/60";

                                return (
                                    <tr key={h.id} className={`transition-colors ${rowClass}`}>
                                        <td className="p-4 font-medium text-gray-900">{h.apellido}, {h.nombre}</td>
                                        <td className="p-4 text-gray-500 font-mono text-xs">
                                            <span className="bg-gray-100 px-2 py-1 rounded">{h.tipoDocumento}</span> {h.numeroDocumento}
                                        </td>
                                        <td className="p-4 text-center">
                                            {renderBotonesRol(h)}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                     </table>
                     
                     {resultados.length === 0 && !buscando && (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                            <Info size={40} className="mb-2 opacity-20"/>
                            <p className="text-sm">{mensaje || "Utilice el buscador para encontrar huéspedes."}</p>
                        </div>
                     )}
                 </div>
            </div>
        </div>

        {/* FOOTER: SELECCIÓN + ACEPTAR */}
        <div className="p-5 border-t border-gray-100 bg-white shrink-0 flex justify-between items-center">
            {/* Lista horizontal de seleccionados */}
            <div className="flex gap-2 overflow-x-auto max-w-[60%] pb-1 scrollbar-thin scrollbar-thumb-gray-200">
                {Array.from(seleccionados.values()).length === 0 && (
                    <span className="text-xs text-gray-400 italic flex items-center gap-2">
                        <Info size={14}/> Ningún huésped seleccionado para esta habitación...
                    </span>
                )}
                {Array.from(seleccionados.values()).map((item:any) => (
                    <div key={item.data.id} className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg text-xs font-bold border shadow-sm whitespace-nowrap transition-all ${item.rol==='TITULAR'?'bg-emerald-100 text-emerald-800 border-emerald-200':'bg-indigo-100 text-indigo-800 border-indigo-200'}`}>
                        {item.rol === 'TITULAR' ? <Crown size={12} className="text-emerald-600"/> : <User size={12} className="text-indigo-600"/>}
                        <span className="truncate max-w-[120px]">{item.data.apellido}</span>
                        <button onClick={()=> { const m = new Map(seleccionados); m.delete(item.data.id); setSeleccionados(m); }} className="p-1 hover:bg-white/50 rounded-full text-gray-500 hover:text-rose-500 transition-colors">
                            <X size={12}/>
                        </button>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleConfirmar} 
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={seleccionados.size === 0}
            >
                <Check size={18}/>
                <span>CONFIRMAR ({seleccionados.size})</span>
            </button>
        </div>
      </div>
    </div>
  );
}