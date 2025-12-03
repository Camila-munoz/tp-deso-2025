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

    // 1. PRIORIDAD: Si está en el CARRITO (Confirmado visualmente)
    // Verificamos si esta celda cae dentro de algún rango del carrito
    const enCarrito = carrito.find(item => 
        item.idHab === idHab && fechaIso >= item.inicio && fechaIso <= item.fin
    );
    if (enCarrito) return "bg-blue-600 text-white"; // Azul Fuerte

    // 2. PRIORIDAD: Selección en curso (Arrastre)
    if (seleccionInicio && seleccionInicio.idHab === idHab) {
        const fInicio = new Date(seleccionInicio.fechaIso).getTime();
        const fActual = new Date(fechaIso).getTime();
        const fHover = hoverFecha ? new Date(hoverFecha).getTime() : fInicio;
        const min = Math.min(fInicio, fHover);
        const max = Math.max(fInicio, fHover);

        if (fActual >= min && fActual <= max) {
            if (estadoBD !== "LIBRE") return "bg-red-500 opacity-50 cursor-not-allowed";
            return "bg-blue-300"; // Azul Claro
        }
    }

    // 3. ESTADOS BASE
    if (estadoBD === "OCUPADA") return "bg-[#f87171] hover:bg-red-500";
    if (estadoBD === "RESERVADA") return "bg-[#fef08a] hover:bg-yellow-300";
    if (estadoBD === "LIBRE") return "bg-[#d9f99d] hover:bg-lime-400";
    return "bg-gray-100";
  };

  if (dias.length === 0) return null;

  return (
    <div className="overflow-x-auto bg-white border border-gray-400 shadow-lg rounded-sm select-none" onMouseLeave={() => setHoverFecha(null)}>
      <table className="w-full border-collapse text-xs text-center table-fixed">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="border-r border-gray-300 p-2 min-w-[100px] font-serif text-gray-700 sticky left-0 bg-gray-100 z-20 shadow-sm">FECHA</th>
            {Object.keys(habitacionesPorTipo).map((tipo) => (
              <th key={tipo} colSpan={habitacionesPorTipo[tipo].length} className="border-r border-gray-300 p-2 font-bold font-serif text-blue-900 uppercase tracking-wider text-xs">{tipo}</th>
            ))}
          </tr>
          <tr className="bg-white border-b border-gray-300">
            <th className="border-r border-gray-300 bg-gray-50 sticky left-0 z-20 shadow-sm"></th>
            {Object.keys(habitacionesPorTipo).map((tipo) => (
              habitacionesPorTipo[tipo].map((hab: any) => (
                <th key={hab.id} className="border-r border-gray-300 p-1 w-10 font-bold text-gray-600 hover:bg-gray-100 cursor-help" title={hab.numero}>{hab.numero}</th>
              ))
            ))}
          </tr>
        </thead>
        <tbody>
          {dias.map((dia) => (
            <tr key={dia.iso} className="h-9 border-b border-gray-200 hover:bg-gray-50">
              <td className="border-r border-gray-300 font-bold bg-white text-gray-700 sticky left-0 z-10 shadow-sm">{dia.label}</td>
              {Object.keys(habitacionesPorTipo).map((tipo) => (
                habitacionesPorTipo[tipo].map((hab: any) => (
                  <td key={hab.id} className="p-0 border-r border-gray-200">
                    <div 
                      onClick={() => onCellClick(hab, dia.index, dia.iso)}
                      onMouseEnter={() => setHoverFecha(dia.iso)}
                      className={`w-full h-9 cursor-pointer transition-all duration-75 border-b border-white/20 ${getCellClass(hab.id, dia.iso)}`}
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