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
        return enCarrito.colorForzado || "bg-blue-600 text-white shadow-inner";
    }

    // 2. Selección en curso
    if (seleccionInicio && seleccionInicio.idHab === idHab) {
        const fInicio = new Date(seleccionInicio.fechaIso).getTime();
        const fActual = new Date(fechaIso).getTime();
        const fHover = hoverFecha ? new Date(hoverFecha).getTime() : fInicio;
        
        const min = Math.min(fInicio, fHover);
        const max = Math.max(fInicio, fHover);

        if (fActual >= min && fActual <= max) {
            if (estadoBD !== "LIBRE" && estadoBD !== "RESERVADA") return "bg-red-500 opacity-60 cursor-not-allowed";
            return "bg-blue-300"; 
        }
    }

    // 3. Estados BD (COLORES ORIGINALES RESTAURADOS)
    if (estadoBD === "OCUPADA") return "bg-[#f87171] hover:bg-red-500"; 
    if (estadoBD === "RESERVADA") return "bg-[#fef08a] hover:bg-yellow-300"; 
    if (estadoBD === "LIBRE") return "bg-[#d9f99d] hover:bg-lime-400 cursor-pointer"; 
    if (estadoBD === "FUERA_DE_SERVICIO") return "bg-gray-400 cursor-not-allowed";
    
    return "bg-gray-100";
  };

  if (!dias || dias.length === 0) return <div className="p-10 text-center text-gray-400 font-medium">Seleccione un rango de fechas.</div>;

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-300 shadow-md select-none" onMouseLeave={() => setHoverFecha(null)}>
      <table className="w-full border-collapse text-xs text-center table-fixed min-w-[800px]">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="p-3 w-24 text-gray-700 font-bold sticky left-0 bg-gray-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">FECHA</th>
            {Object.keys(habitacionesPorTipo).map((tipo) => (
              <th 
                key={tipo} 
                colSpan={habitacionesPorTipo[tipo].length} 
                className="p-2 font-bold text-blue-900 uppercase tracking-wider text-[10px] border-l border-gray-300"
              >
                {tipo}
              </th>
            ))}
          </tr>
          <tr className="bg-white border-b border-gray-300">
            <th className="sticky left-0 bg-white z-20 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"></th>
            {Object.keys(habitacionesPorTipo).map((tipo) => (
              habitacionesPorTipo[tipo].map((hab: any) => (
                <th 
                    key={hab.id} 
                    className="p-2 w-10 font-bold text-gray-600 hover:text-blue-600 cursor-help transition-colors border-l border-gray-200" 
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
            <tr key={dia.iso} className="h-10 border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="sticky left-0 bg-white z-10 text-gray-700 font-bold border-r border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                {dia.label}
              </td>
              {Object.keys(habitacionesPorTipo).map((tipo) => (
                habitacionesPorTipo[tipo].map((hab: any) => (
                  <td key={hab.id} className="p-[1px] border-r border-gray-200 relative">
                    <div 
                      onClick={() => onCellClick(hab, dia.index, dia.iso)}
                      onMouseEnter={() => setHoverFecha(dia.iso)}
                      className={`w-full h-9 rounded-sm transition-colors duration-75 ${getCellClass(hab.id, dia.iso)}`}
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