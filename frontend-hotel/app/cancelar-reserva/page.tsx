"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function CancelarReservaPage() {
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


  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
      
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-gray-500 hover:text-red-800 font-bold flex items-center gap-1"><span>⬅</span> MENÚ</Link>
      </div>

      {/* TÍTULO */}
      <h1 className="text-4xl text-center text-red-900 font-bold mb-8 font-serif tracking-widest border-b-2 border-red-200 pb-4 px-10 mt-2">
        CANCELAR RESERVA
      </h1>

      {/* --- FORMULARIO DE BÚSQUEDA --- */}
      <div className="bg-white px-10 py-8 rounded-xl shadow-md border border-gray-200 flex flex-col gap-6 mb-8 w-full max-w-4xl">
        
        {/* Inputs */}
        <div className="flex items-start gap-6">
            
            {/* Columna Apellido  */}
            <div className="flex-1 relative">
                <label className="font-bold text-gray-600 text-sm mb-1 uppercase block">Apellido *</label>
                <input 
                    ref={apellidoInputRef}
                    className={`border-2 p-2 rounded-lg text-gray-700 w-full outline-none uppercase transition-colors ${errorApellido ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-400'}`}
                    placeholder="INGRESE APELLIDO"
                    value={apellido}
                    onChange={e => setApellido(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                />
                {/* Mensaje Error Flotante */}
                {errorApellido && (
                    <span className="absolute -bottom-6 left-0 text-red-500 text-xs font-bold animate-pulse">
                        {errorApellido}
                    </span>
                )}
            </div>

            {/* Columna Nombre */}
            <div className="flex-1">
                <label className="font-bold text-gray-600 text-sm mb-1 uppercase block">Nombre (Opcional)</label>
                <input 
                    className="border-2 border-gray-300 p-2 rounded-lg text-gray-700 w-full focus:border-red-400 outline-none uppercase"
                    placeholder="INGRESE NOMBRE"
                    value={nombre}
                    onChange={e => setNombre(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                />
            </div>

            {/* Botón */}
            <div className="h-[70px] flex items-center pt-6">
                <button 
                    onClick={handleBuscar} 
                    disabled={buscando} 
                    className="bg-gray-700 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-gray-800 shadow-md disabled:opacity-50 transition-all h-[42px]"
                >
                    {buscando ? "..." : "BUSCAR"}
                </button>
            </div>
        </div>

        {/* Mensaje General */}
        {mensajeGeneral && (
            <div className="w-full text-center border-t pt-4 mt-2">
                <p className="text-red-600 font-bold bg-red-50 py-2 px-4 rounded inline-block shadow-sm">
                    {mensajeGeneral}
                </p>
            </div>
        )}
      </div>

      {/* --- TABLA DE RESULTADOS --- */}
      {reservas.length > 0 && (
        <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-300 animate-in fade-in slide-in-from-bottom-4">
            <table className="w-full text-center text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                    <tr>
                        <th className="p-4 border-b w-24">Seleccionar</th>
                        <th className="p-4 border-b text-left">Huésped</th>
                        <th className="p-4 border-b">Habitación</th>
                        <th className="p-4 border-b">Tipo</th>
                        <th className="p-4 border-b">Ingreso</th>
                        <th className="p-4 border-b">Egreso</th>
                    </tr>
                </thead>
                <tbody>
                    {reservas.map(r => (
                        <tr 
                            key={r.id} 
                            className={`border-b transition duration-150 cursor-pointer ${seleccionados.includes(r.id) ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                            onClick={() => toggleSeleccion(r.id)}
                        >
                            <td className="p-4">
                                <input 
                                    type="checkbox" 
                                    checked={seleccionados.includes(r.id)}
                                    onChange={() => {}}
                                    className="w-5 h-5 accent-red-600 cursor-pointer"
                                />
                            </td>
                            <td className="p-4 text-left font-bold text-gray-800">
                                {r.apellidoHuesped}, {r.nombreHuesped}
                            </td>
                            <td className="p-4">
                                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-bold text-sm">
                                    {r.habitacion ? r.habitacion.numero : '-'}
                                </span>
                            </td>
                            <td className="p-4 text-xs font-bold text-gray-500 uppercase">
                                {r.habitacion?.tipo?.descripcion || "ESTÁNDAR"}
                            </td>
                            <td className="p-4 text-gray-600">{r.fechaEntrada}</td>
                            <td className="p-4 text-gray-600">{r.fechaSalida}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="p-4 bg-gray-50 border-t flex justify-end">
                <button 
                    disabled={seleccionados.length === 0}
                    onClick={() => setMostrarConfirmacion(true)}
                    className="bg-red-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    CANCELAR SELECCIONADAS ({seleccionados.length})
                </button>
            </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 w-[500px] rounded-lg shadow-2xl border-t-8 border-red-600 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 font-serif">¿Confirmar Cancelación?</h3>
                
                <div className="bg-red-50 p-4 rounded border border-red-100 mb-6 text-left text-sm text-gray-700 space-y-3 max-h-60 overflow-y-auto">
                    <p className="text-center font-bold text-red-800 mb-2 border-b border-red-200 pb-2">Se eliminarán las siguientes reservas:</p>
                    {seleccionados.map(id => {
                        const r = reservas.find(res => res.id === id);
                        return (
                            <div key={id} className="flex justify-between items-center pb-1 mb-1 border-b border-red-100 last:border-0">
                                <div>
                                    <span className="font-bold block">{r.apellidoHuesped}, {r.nombreHuesped}</span>
                                    <span className="text-xs text-gray-500">Hab: {r.habitacion?.numero} ({r.habitacion?.tipo?.descripcion})</span>
                                </div>
                                <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-gray-300">#{r.id}</span>
                            </div>
                        );
                    })}
                </div>
                
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setMostrarConfirmacion(false)} className="px-8 py-3 border-2 border-red-600 text-red-600 rounded font-bold hover:bg-red-50 w-40">
                        CANCELAR
                    </button>
                    <button onClick={handleAceptarCancelacion} className="px-8 py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700 shadow-lg w-40">
                        ACEPTAR
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE ÉXITO --- */}
      {mostrarExito && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm animate-in zoom-in duration-200">
             <div className="bg-white p-10 rounded-xl shadow-2xl text-center w-[500px] border-b-8 border-green-500 relative">
                 {/* Botón X para cerrar también */}
                 <button onClick={()=>{setMostrarExito(false)}} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold">✕</button>

                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
                    ✓
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Reservas Canceladas</h2>
                 <p className="text-gray-500 mb-8">Las habitaciones han sido liberadas correctamente.</p>
                 
                 <p className="text-xs text-gray-400 uppercase font-bold tracking-widest animate-pulse">
                    Presione una tecla para continuar...
                 </p>
                 
                 <button className="sr-only" autoFocus onClick={() => setMostrarExito(false)}>Cerrar</button>
             </div>
        </div>
      )}

    </div>
  );
}