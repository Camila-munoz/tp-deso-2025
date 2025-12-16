"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Trash2, AlertCircle, CheckCircle, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function CancelarReservaPage() {
  // --- LÓGICA ORIGINAL INTACTA ---
  const [apellido, setApellido] = useState("");
  const [nombre, setNombre] = useState("");
  
  const [reservas, setReservas] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  
  const [buscando, setBuscando] = useState(false);
  
  // Mensajes de error específicos
  const [errorApellido, setErrorApellido] = useState(""); 
  const [mensajeGeneral, setMensajeGeneral] = useState("");

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  const apellidoInputRef = useRef<HTMLInputElement>(null);

  // --- BUSCAR ---
  const handleBuscar = async () => {
    setErrorApellido("");
    setMensajeGeneral("");
    
    if (!apellido.trim()) {
        setErrorApellido("El campo apellido no puede estar vacío.");
        apellidoInputRef.current?.focus();
        return;
    }
    
    setBuscando(true);
    setReservas([]);
    setSeleccionados([]);

    try {
      const params = new URLSearchParams({ apellido });
      if (nombre.trim()) params.append("nombre", nombre);

      const res = await fetch(`${API_URL}/reservas/buscar?${params}`);
      const data = await res.json();
      
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setReservas(data);
      } else {
        setMensajeGeneral("No existen reservas para los criterios de búsqueda.");
        apellidoInputRef.current?.focus();
      }
    } catch (e) {
      setMensajeGeneral("Error de conexión con el servidor.");
    } finally {
      setBuscando(false);
    }
  };

  // --- SELECCIÓN ---
  const toggleSeleccion = (id: number) => {
    if (seleccionados.includes(id)) {
        setSeleccionados(seleccionados.filter(sid => sid !== id));
    } else {
        setSeleccionados([...seleccionados, id]);
    }
  };

  // --- CONFIRMAR ---
  const handleAceptarCancelacion = async () => {
    try {
        const res = await fetch(`${API_URL}/reservas/cancelar-multiples`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(seleccionados)
        });

        if (res.ok) {
            setMostrarConfirmacion(false);
            setMostrarExito(true);
        } else {
            alert("Error al cancelar reservas.");
        }
    } catch (e) { alert("Error de conexión"); }
  };

  // --- EFECTO TECLA EXIT ---
  useEffect(() => {
    if (mostrarExito) {
        const handleKeyPress = () => {
            setMostrarExito(false);
            setApellido("");
            setNombre("");
            setReservas([]);
            setSeleccionados([]);
            setMensajeGeneral("");
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [mostrarExito]);

  // --- RENDERIZADO CON NUEVA ESTÉTICA Y FOOTER ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans relative flex flex-col items-center">
      
      {/* HEADER / BACK BUTTON */}
      <div className="w-full max-w-5xl mb-8 flex items-center justify-between">
         <Link href="/principal" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium">
            <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                <ArrowLeft size={20} />
            </div>
            <span>Volver al Menú</span>
         </Link>
      </div>

      {/* TÍTULO */}
      <div className="w-full max-w-5xl mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cancelar Reserva</h1>
          <p className="text-gray-500 text-sm mt-1">Busque y seleccione las reservas que desea anular.</p>
      </div>

      {/* --- FORMULARIO DE BÚSQUEDA --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 mb-8 w-full max-w-5xl">
        
        {/* Inputs Container */}
        <div className="flex flex-col md:flex-row items-start gap-6">
            
            {/* Columna Apellido  */}
            <div className="flex-1 w-full relative">
                <label className="font-bold text-gray-500 text-xs mb-2 uppercase block tracking-wide">Apellido <span className="text-rose-500">*</span></label>
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input 
                        ref={apellidoInputRef}
                        className={`w-full bg-gray-50 border ${errorApellido ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all uppercase font-medium text-gray-700 placeholder-gray-400`}
                        placeholder="INGRESE APELLIDO"
                        value={apellido}
                        onChange={e => setApellido(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                    />
                </div>
                {/* Mensaje Error Flotante */}
                {errorApellido && (
                    <div className="absolute -bottom-6 left-0 text-rose-500 text-xs font-bold flex items-center gap-1">
                        <AlertCircle size={12} /> {errorApellido}
                    </div>
                )}
            </div>

            {/* Columna Nombre */}
            <div className="flex-1 w-full">
                <label className="font-bold text-gray-500 text-xs mb-2 uppercase block tracking-wide">Nombre (Opcional)</label>
                <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all uppercase font-medium text-gray-700 placeholder-gray-400"
                    placeholder="INGRESE NOMBRE"
                    value={nombre}
                    onChange={e => setNombre(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                />
            </div>

            {/* Botón */}
            <div className="h-[74px] flex items-end">
                <button 
                    onClick={handleBuscar} 
                    disabled={buscando} 
                    className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg shadow-gray-200 disabled:opacity-70 transition-all flex items-center gap-2"
                >
                    {buscando ? <span className="animate-pulse">...</span> : <Search size={18} />}
                    {buscando ? "BUSCANDO" : "BUSCAR"}
                </button>
            </div>
        </div>

        {/* Mensaje General */}
        {mensajeGeneral && (
            <div className="w-full border-t border-gray-100 pt-4 mt-2">
                <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-xl border border-amber-100 flex items-center justify-center gap-2 text-sm font-medium">
                    <AlertCircle size={18} />
                    {mensajeGeneral}
                </div>
            </div>
        )}
      </div>

      {/* --- TABLA DE RESULTADOS --- */}
      {reservas.length > 0 && (
        <div className="w-full max-w-5xl bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="overflow-x-auto">
                <table className="w-full text-center text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                        <tr>
                            <th className="p-5 w-24">Seleccionar</th>
                            <th className="p-5 text-left">Huésped</th>
                            <th className="p-5">Habitación</th>
                            <th className="p-5">Tipo</th>
                            <th className="p-5">Ingreso</th>
                            <th className="p-5">Egreso</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {reservas.map(r => (
                            <tr 
                                key={r.id} 
                                className={`transition duration-150 cursor-pointer ${seleccionados.includes(r.id) ? 'bg-rose-50/50' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleSeleccion(r.id)}
                            >
                                <td className="p-5">
                                    <div className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-all ${seleccionados.includes(r.id) ? 'bg-rose-500 border-rose-500' : 'border-gray-300 bg-white'}`}>
                                        {seleccionados.includes(r.id) && <CheckCircle size={14} className="text-white"/>}
                                    </div>
                                </td>
                                <td className="p-5 text-left font-bold text-gray-800">
                                    {r.apellidoHuesped}, {r.nombreHuesped}
                                </td>
                                <td className="p-5">
                                    <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full font-bold text-xs">
                                        {r.habitacion ? r.habitacion.numero : '-'}
                                    </span>
                                </td>
                                <td className="p-5 text-xs font-bold text-gray-500 uppercase">
                                    {r.habitacion?.tipo?.descripcion || "ESTÁNDAR"}
                                </td>
                                <td className="p-5 text-gray-600 font-medium">{r.fechaEntrada}</td>
                                <td className="p-5 text-gray-600 font-medium">{r.fechaSalida}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                    disabled={seleccionados.length === 0}
                    onClick={() => setMostrarConfirmacion(true)}
                    className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <Trash2 size={18} />
                    CANCELAR SELECCIONADAS ({seleccionados.length})
                </button>
            </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2025 Hotel Premier - Sistema de Gestión</p>
          <p className="text-xs mt-1 opacity-70">Diseño de Sistemas - TP Final</p>
      </footer>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 w-[480px] rounded-3xl shadow-2xl text-center">
                <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Confirmar Cancelación?</h3>
                <p className="text-gray-500 mb-6">Esta acción es irreversible.</p>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 text-left text-sm text-gray-700 space-y-3 max-h-60 overflow-y-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reservas a eliminar:</p>
                    {seleccionados.map(id => {
                        const r = reservas.find(res => res.id === id);
                        return (
                            <div key={id} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                <div>
                                    <span className="font-bold block text-gray-800">{r.apellidoHuesped}, {r.nombreHuesped}</span>
                                    <span className="text-xs text-gray-500">Hab: {r.habitacion?.numero}</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-gray-400">#{r.id}</span>
                            </div>
                        );
                    })}
                </div>
                
                <div className="flex gap-3">
                    <button onClick={() => setMostrarConfirmacion(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        Volver
                    </button>
                    <button onClick={handleAceptarCancelacion} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE ÉXITO --- */}
      {mostrarExito && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm animate-in zoom-in duration-200">
             <div className="bg-white p-10 rounded-3xl shadow-2xl text-center w-[480px] relative">
                 <button onClick={()=>{setMostrarExito(false)}} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold bg-gray-50 p-2 rounded-full"><X size={20}/></button>

                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservas Canceladas</h2>
                 <p className="text-gray-500 mb-8">Las habitaciones han sido liberadas correctamente.</p>
                 
                 <div className="text-xs text-gray-400 uppercase font-bold tracking-widest animate-pulse mb-2">
                    Presione una tecla para continuar...
                 </div>
                 
                 <button className="sr-only" autoFocus onClick={() => setMostrarExito(false)}>Cerrar</button>
             </div>
        </div>
      )}

    </div>
  );
}