"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- 1. IMPORTAR ESTO
import { buscarHuespedes } from "@/services/api";

export default function HuespedesPage() {
  const router = useRouter(); // <--- 2. INICIALIZAR EL ROUTER

  // --- ESTADOS ---
  const [filtros, setFiltros] = useState({ apellido: "", nombre: "", numDoc: "", tipoDoc: "" });
  const [resultados, setResultados] = useState<any[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // --- LÓGICA BUSCAR ---
  const handleBuscar = async () => {
    setCargando(true);
    setResultados([]);
    setMensaje("");
    setSeleccionado(null);

    try {
      const data = await buscarHuespedes(filtros);
      if (data.success) {
        setResultados(data.data);
        if (data.data.length === 0) setMensaje("No se encontraron resultados.");
      } else {
        setMensaje(data.message || "No se encontraron resultados.");
      }
    } catch (error) {
      setMensaje("Error de conexión.");
    } finally {
      setCargando(false);
    }
  };

  // --- LÓGICA SIGUIENTE ---
  const handleSiguiente = () => {
    if (seleccionado) {
      const huesped = resultados.find(h => h.id === seleccionado);
      if (huesped) {
        // Redirigir a la ruta dinámica: /huespedes/editar/DNI/12345
        router.push(`/huespedes/editar/${huesped.tipoDocumento}/${huesped.numeroDocumento}`);
      }
    } else {
      alert("Por favor, seleccione un huésped de la lista.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-6">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-red-700 drop-shadow-md" style={{ fontFamily: 'serif', letterSpacing: '2px' }}>
          BUSCAR HUÉSPED
        </h1>

        <button className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-black hover:bg-red-600 shadow-md">
          X
        </button>
      </div>

      {/* --- FORMULARIO DE BÚSQUEDA --- */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'serif' }}>Datos del Huésped</h2>
        
        <div className="bg-gradient-to-b from-sky-200 to-gray-300 border border-gray-500 p-8 rounded-md shadow-md mb-6 relative">
          
          <div className="grid gap-4 max-w-2xl mx-auto">
            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Nombre:</label>
              <input 
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner"
                placeholder="Ingrese el Nombre"
                value={filtros.nombre}
                onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
              />
            </div>

            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Apellido:</label>
              <input 
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner"
                placeholder="Ingrese el Apellido"
                value={filtros.apellido}
                onChange={(e) => setFiltros({...filtros, apellido: e.target.value})}
              />
            </div>

            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Tipo de Documento:</label>
              <select 
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner bg-white"
                value={filtros.tipoDoc}
                onChange={(e) => setFiltros({...filtros, tipoDoc: e.target.value})}
              >
                <option value="">Seleccione el tipo de Documento</option>
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="LE">LE</option>
                <option value="LC">LC</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Documento:</label>
              <input 
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner"
                placeholder="Ingrese el Número de Documento"
                value={filtros.numDoc}
                onChange={(e) => setFiltros({...filtros, numDoc: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button 
              onClick={handleBuscar}
              className="bg-sky-200 border-2 border-sky-400 text-black font-bold px-10 py-1.5 rounded hover:bg-sky-300 shadow-sm transition-all active:scale-95 font-serif"
            >
              {cargando ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>

        {/* --- LISTA DE RESULTADOS --- */}
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'serif' }}>Lista de Huéspedes</h2>
        
        <div className="border border-gray-500 bg-white min-h-[200px] relative">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-sky-100 shadow-sm">
                <tr>
                  <th className="border border-gray-400 p-2 font-serif">Apellido</th>
                  <th className="border border-gray-400 p-2 font-serif">Nombre</th>
                  <th className="border border-gray-400 p-2 font-serif">Tipo de Documento</th>
                  <th className="border border-gray-400 p-2 font-serif">Documento</th>
                </tr>
              </thead>
              <tbody>
                {resultados.length > 0 ? (
                  resultados.map((h: any) => (
                    <tr 
                      key={h.id}
                      onClick={() => setSeleccionado(h.id)}
                      className={`cursor-pointer border-b border-gray-200 hover:bg-yellow-100 ${seleccionado === h.id ? 'bg-blue-200' : ''}`}
                    >
                      <td className="border-r border-gray-300 p-2 text-center">{h.apellido}</td>
                      <td className="border-r border-gray-300 p-2 text-center">{h.nombre}</td>
                      <td className="border-r border-gray-300 p-2 text-center">{h.tipoDocumento}</td>
                      <td className="p-2 text-center">{h.numeroDocumento}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                      {mensaje || "Utilice el formulario para buscar."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- BOTONES INFERIORES --- */}
        <div className="flex justify-center mt-6 gap-4">
          <button 
            onClick={handleSiguiente}
            className="bg-sky-200 border-2 border-sky-400 text-black font-bold px-12 py-1.5 rounded hover:bg-sky-300 shadow-sm font-serif"
          >
            Siguiente
          </button>

          {/* 3. BOTÓN NUEVO QUE REDIRIGE A LA PÁGINA DE ALTA */}
          <button 
            onClick={() => router.push('/huespedes/nuevo')}
            className="bg-gray-200 border-2 border-gray-400 text-black font-bold px-6 py-1.5 rounded hover:bg-gray-300 shadow-sm font-serif text-sm"
          >
            + Nuevo
          </button>
        </div>

      </div>
    </div>
  );
}