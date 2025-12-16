"use client";
import React, { useState } from "react";

interface Props {
  habitaciones: any[];
  estados: Record<string, string>;
  dias: { label: string; iso: string; index: number }[];
  onCellClick: (hab: any, diaIndex: number, fechaIso: string) => void;
  seleccionInicio?: { idHab: number; fechaIso: string } | null;
  carrito?: any[];
}

export default function Grilla({ habitaciones, estados, dias, onCellClick, seleccionInicio, carrito = [] }: Props) {
  const [hoverFecha, setHoverFecha] = useState<string | null>(null);

  // Agrupar habitaciones por tipo
  const habitacionesPorTipo = habitaciones.reduce((acc: any, hab: any) => {
    const tipo = hab.tipo?.descripcion || "General";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(hab);
    return acc;
  }, {});

  const getCellClass = (idHab: number, fechaIso: string) => {
    const key = `${idHab}_${fechaIso}`;
    const estadoBD = estados[key] || "LIBRE";

    // 1. Carrito (Selección confirmada)
    const enCarrito = carrito.find(item => 
        item.idHab === idHab && fechaIso >= item.inicio && fechaIso <= item.fin
    );

    if (enCarrito) {
        // Usa el color forzado si existe (bloqueo visual), sino azul estándar
        return enCarrito.colorForzado || "bg-indigo-600 text-white shadow-inner";
    }

    // 2. Selección en curso (Rango dinámico al hacer click)
    if (seleccionInicio && seleccionInicio.idHab === idHab) {
        const fInicio = new Date(seleccionInicio.fechaIso).getTime();
        const fActual = new Date(fechaIso).getTime();
        const fHover = hoverFecha ? new Date(hoverFecha).getTime() : fInicio;
        
        // Calcular min y max para pintar el rango
        const min = Math.min(fInicio, fHover);
        const max = Math.max(fInicio, fHover);

        if (fActual >= min && fActual <= max) {
            // Si el rango pasa por encima de una ocupada, mostrar error visual
            if (estadoBD !== "LIBRE" && estadoBD !== "RESERVADA") return "bg-rose-500 opacity-50 cursor-not-allowed";
            return "bg-indigo-300"; 
        }
    }

    // 3. Estados BD (Estilo Moderno)
    if (estadoBD === "OCUPADA") return "bg-rose-400/90 hover:bg-rose-500"; // Rojo suave
    if (estadoBD === "RESERVADA") return "bg-amber-300/80 hover:bg-amber-400"; // Amarillo suave
    if (estadoBD === "LIBRE") return "bg-emerald-100 hover:bg-emerald-200 cursor-pointer"; // Verde muy claro
    if (estadoBD === "FUERA_DE_SERVICIO") return "bg-gray-300 cursor-not-allowed repeating-linear-gradient-45"; // Gris
    
    return "bg-gray-50";
  };

  if (!dias || dias.length === 0) return <div className="p-4 text-center text-gray-400">Seleccione un rango de fechas.</div>;

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm select-none" onMouseLeave={() => setHoverFecha(null)}>
      <table className="w-full border-collapse text-xs text-center table-fixed min-w-[800px]">
        <thead>
          {/* Fila Superior: Tipos de Habitación */}
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-3 w-24 text-gray-500 font-bold sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">FECHA</th>
            {Object.keys(habitacionesPorTipo).map((tipo) => (
              <th 
                key={tipo} 
                colSpan={habitacionesPorTipo[tipo].length} 
                className="p-2 font-bold text-indigo-900 uppercase tracking-wider text-[10px] border-l border-gray-200"
              >
                {tipo}
              </th>
            ))}
          </tr>
          {/* Fila Inferior: Números de Habitación */}
          <tr className="bg-white border-b border-gray-200">
            <th className="sticky left-0 bg-white z-20 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"></th>
            {Object.keys(habitacionesPorTipo).map((tipo) => (
              habitacionesPorTipo[tipo].map((hab: any) => (
                <th 
                    key={hab.id} 
                    className="p-2 w-10 font-medium text-gray-500 hover:text-indigo-600 cursor-help transition-colors border-l border-gray-50" 
                    title={`Habitación ${hab.numero}`}
                >
                    {hab.numero}
                </th>
              ))
            ))}
          </tr>
        </thead>
        <tbody>
          {dias.map((dia) => (
            <tr key={dia.iso} className="h-10 border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
              {/* Columna Fecha */}
              <td className="sticky left-0 bg-white z-10 text-gray-600 font-medium border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                {dia.label}
              </td>
              
              {/* Celdas */}
              {Object.keys(habitacionesPorTipo).map((tipo) => (
                habitacionesPorTipo[tipo].map((hab: any) => (
                  <td key={hab.id} className="p-1 border-r border-gray-50 relative">
                    <div 
                      onClick={() => onCellClick(hab, dia.index, dia.iso)}
                      onMouseEnter={() => setHoverFecha(dia.iso)}
                      className={`w-full h-8 rounded-md transition-all duration-150 ${getCellClass(hab.id, dia.iso)}`}
                    ></div>
                  </td>
                ))
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}