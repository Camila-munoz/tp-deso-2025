"use client";

import React, { useState, useEffect } from "react";

type Props = {
  reservas: any[];
  loading: boolean;
  onAceptar: (ids: number[]) => void;
  onCancelar: (clearSelectionCb?: () => void) => void;
};

export default function ReservationGrid({ reservas, loading, onAceptar, onCancelar }: Props) {
  const [seleccionadas, setSeleccionadas] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // Reset selections cuando cambian las reservas
    setSeleccionadas({});
    setSelectAll(false);
  }, [reservas]);

  const toggleSeleccion = (id: number) => {
    setSeleccionadas((prev) => {
      const copy = { ...prev, [id]: !prev[id] };
      const totalSel = Object.keys(copy).filter((k) => copy[Number(k)]).length;
      setSelectAll(totalSel === reservas.length && reservas.length > 0);
      return copy;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSeleccionadas({});
      setSelectAll(false);
    } else {
      const map: Record<number, boolean> = {};
      reservas.forEach((r) => (map[r.id] = true));
      setSeleccionadas(map);
      setSelectAll(true);
    }
  };

  const handleAceptar = () => {
    const ids = Object.keys(seleccionadas)
      .filter((k) => seleccionadas[Number(k)])
      .map((k) => Number(k));
    onAceptar(ids);
  };

  const handleCancelar = () => {
    // Limpiar selecciones
    setSeleccionadas({});
    setSelectAll(false);
    
    // Llamar a onCancelar (que abrirá el modal de Volver al Menú)
    onCancelar(() => {
      setSeleccionadas({});
      setSelectAll(false);
    });
  };

  const selectedCount = Object.keys(seleccionadas).filter(k => seleccionadas[Number(k)]).length;

  return (
    <div className="space-y-4">
      {/* Contador de selecciones */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-800 font-medium">
                {selectedCount} reserva(s) seleccionada(s)
              </span>
            </div>
            <button
              onClick={() => {
                setSeleccionadas({});
                setSelectAll(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Deseleccionar todas
            </button>
          </div>
        </div>
      )}

      {/* Tabla de reservas */}
      <div className="overflow-hidden border border-gray-300 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
                <th className="p-4 border-r border-blue-700 w-14">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectAll} 
                      onChange={toggleSelectAll}
                      disabled={reservas.length === 0}
                      className="h-5 w-5 text-blue-300 bg-white border-gray-300 rounded 
                               focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                  </div>
                </th>
                <th className="p-4 border-r border-blue-700 text-left font-semibold text-sm uppercase tracking-wider">
                  Apellido
                </th>
                <th className="p-4 border-r border-blue-700 text-left font-semibold text-sm uppercase tracking-wider">
                  Nombres
                </th>
                <th className="p-4 border-r border-blue-700 text-left font-semibold text-sm uppercase tracking-wider">
                  Número Hab.
                </th>
                <th className="p-4 border-r border-blue-700 text-left font-semibold text-sm uppercase tracking-wider">
                  Tipo Hab.
                </th>
                <th className="p-4 border-r border-blue-700 text-left font-semibold text-sm uppercase tracking-wider">
                  Fecha inicial
                </th>
                <th className="p-4 border-r border-blue-700 text-left font-semibold text-sm uppercase tracking-wider">
                  Fecha final
                </th>
                <th className="p-4 text-left font-semibold text-sm uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservas.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-lg">Cargando reservas...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          <span className="text-lg font-medium text-gray-700 mb-2">No hay reservas encontradas</span>
                          <span className="text-gray-600">No se encontraron reservas activas para este huésped.</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              
              {reservas.map((r) => {
                const primeraHab = r.habitaciones && r.habitaciones[0] ? r.habitaciones[0] : {};
                const isSelected = !!seleccionadas[r.id];
                
                return (
                  <tr 
                    key={r.id} 
                    className={`transition duration-150 ${isSelected ? 'bg-blue-50' : 'hover:bg-blue-50'} 
                              ${r.estado !== 'CONFIRMADA' ? 'opacity-80' : ''}`}
                    onClick={() => toggleSeleccion(r.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'} 
                                   bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200 font-medium text-gray-900">
                      {r.huesped?.apellido || "-"}
                    </td>
                    <td className="p-4 border-r border-gray-200 text-gray-900">
                      {r.huesped?.nombre || "-"}
                    </td>
                    <td className="p-4 border-r border-gray-200 text-gray-900">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 rounded-full font-semibold">
                        {primeraHab.numero || "-"}
                      </span>
                    </td>
                    <td className="p-4 border-r border-gray-200 text-gray-900">
                      {primeraHab.tipo?.descripcion || "-"}
                    </td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{r.fechaEntrada}</span>
                        <span className="text-xs text-gray-600">Check-in</span>
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{r.fechaSalida}</span>
                        <span className="text-xs text-gray-600">Check-out</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full 
                                      ${r.estado === 'CONFIRMADA' 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                          {r.estado}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
        <div className="text-gray-600 text-sm">
          {reservas.length > 0 && (
            <span>Mostrando {reservas.length} reserva(s)</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleAceptar}
            disabled={loading || selectedCount === 0}
            className={`px-6 py-3 rounded-lg font-medium shadow-md transition duration-200 
                     ${selectedCount === 0 
                       ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                       : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'}`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              CANCELAR {selectedCount > 0 && `(${selectedCount})`}
            </div>
          </button>
          
          <button
            onClick={handleCancelar}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg 
                     font-medium shadow-md hover:from-gray-500 hover:to-gray-600 
                     transition duration-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              VOLVER
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}