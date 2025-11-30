"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones } from "@/services/api";

export default function EstadoHabitacionesPage() {
  // Fechas por defecto (hoy y dentro de 7 días)
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [fechaDesde, setFechaDesde] = useState(today);
  const [fechaHasta, setFechaHasta] = useState(nextWeek);
  
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({}); // Mapa ID -> Estado
  const [cargando, setCargando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // 1. Cargar la estructura de habitaciones al inicio
  useEffect(() => {
    getHabitaciones().then(data => setHabitaciones(data)).catch(console.error);
  }, []);

  // 2. Función Buscar
  const handleBuscar = async () => {
    setCargando(true);
    try {
      const res = await getEstadoHabitaciones(fechaDesde, fechaHasta);
      if (res.success) {
        setEstados(res.data); // Guardamos el mapa de estados
        setBusquedaRealizada(true);
      }
    } catch (err) {
      alert("Error al buscar estados");
    } finally {
      setCargando(false);
    }
  };

  // --- LÓGICA DE VISUALIZACIÓN ---

  // Agrupar habitaciones por Categoría/Tipo para las cabeceras (Como en tu imagen)
  // Estructura: { "Doble Estándar": [hab1, hab2], "Suite": [hab3] }
  const habitacionesPorTipo = habitaciones.reduce((acc: any, hab: any) => {
    const tipo = hab.tipo?.descripcion || "Sin Categoría";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(hab);
    return acc;
  }, {});

  // Generar array de días para las filas (1, 2, 3...)
  const getDiasRango = () => {
    const start = new Date(fechaDesde);
    const end = new Date(fechaHasta);
    const dias = [];
    let count = 1;
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      dias.push(count++);
    }
    return dias;
  };

  const dias = busquedaRealizada ? getDiasRango() : [];

  // Función para determinar color según estado
  const getColor = (idHabitacion: number) => {
    const estado = estados[idHabitacion]; // LIBRE, OCUPADA, RESERVADA
    switch (estado) {
      case "OCUPADA": return "bg-red-500";      // Rojo
      case "RESERVADA": return "bg-yellow-200"; // Amarillo (o beige)
      case "LIBRE": return "bg-lime-300";       // Verde lima
      case "FUERA_DE_SERVICIO": return "bg-gray-400";
      default: return "bg-gray-100"; // Desconocido o sin búsqueda
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-red-700 drop-shadow-md" style={{ fontFamily: 'serif' }}>
          MOSTRAR ESTADO DE HABITACIONES
        </h1>
      </div>

      {/* Panel de Filtros (Caja Azul) */}
      <div className="bg-blue-200 border-2 border-blue-400 p-6 rounded-lg shadow-md max-w-4xl mx-auto mb-8 flex flex-col items-center gap-4">
        <div className="flex gap-10 items-center w-full justify-center">
          <div className="flex items-center gap-2">
            <label className="font-bold text-xl">Desde:</label>
            <input 
              type="date" 
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border p-2 rounded text-center"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-xl">Hasta:</label>
            <input 
              type="date" 
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border p-2 rounded text-center"
            />
          </div>
        </div>
        
        <button 
          onClick={handleBuscar}
          disabled={cargando}
          className="bg-sky-300 border-2 border-sky-500 px-8 py-2 rounded font-bold hover:bg-sky-400 transition shadow-sm"
        >
          {cargando ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {/* GRILLA DE HABITACIONES */}
      {busquedaRealizada && (
        <div className="max-w-full overflow-x-auto bg-white border-4 border-sky-200 p-1 shadow-lg">
          <table className="w-full border-collapse">
            
            {/* Cabecera 1: Tipos de Habitación */}
            <thead>
              <tr className="bg-sky-100 border-b border-sky-300">
                <th className="p-2 border-r border-sky-300 w-24">Días de Rango</th>
                {Object.keys(habitacionesPorTipo).map((tipo) => (
                  <th 
                    key={tipo} 
                    colSpan={habitacionesPorTipo[tipo].length} 
                    className="p-2 border-r border-sky-300 text-center font-bold text-sm"
                  >
                    {tipo}
                  </th>
                ))}
              </tr>

              {/* Cabecera 2: Números de Habitación */}
              <tr className="bg-white border-b border-gray-300">
                <th className="p-2 border-r bg-gray-50"></th> {/* Espacio para columna días */}
                {Object.keys(habitacionesPorTipo).map((tipo) => (
                  habitacionesPorTipo[tipo].map((hab: any) => (
                    <th key={hab.id} className="p-2 border-r border-gray-200 text-center text-xs w-12">
                      {hab.numero}
                    </th>
                  ))
                ))}
              </tr>
            </thead>

            {/* Cuerpo: Días */}
            <tbody>
              {dias.map((dia) => (
                <tr key={dia} className="border-b border-gray-100 hover:bg-gray-50">
                  {/* Columna Nro de Día */}
                  <td className="p-2 border-r border-gray-200 text-center font-bold">{dia}</td>
                  
                  {/* Celdas de Estado */}
                  {Object.keys(habitacionesPorTipo).map((tipo) => (
                    habitacionesPorTipo[tipo].map((hab: any) => (
                      <td key={hab.id} className="p-1 border-r border-gray-200">
                        <div 
                          className={`h-8 w-full ${getColor(hab.id)} rounded-sm transition-colors`}
                          title={`Habitación ${hab.numero} - ${estados[hab.id] || 'Desconocido'}`}
                        ></div>
                      </td>
                    ))
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REFERENCIAS (Leyenda) */}
      <div className="flex justify-center gap-8 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 border border-gray-400"></div>
          <span className="font-bold text-lg">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lime-300 border border-gray-400"></div>
          <span className="font-bold text-lg">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-200 border border-gray-400"></div>
          <span className="font-bold text-lg">Reservado</span>
        </div>
      </div>
    </div>
  );
}