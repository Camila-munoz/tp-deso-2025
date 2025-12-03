"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReservationGrid from "./components/ReservationGrid";
import { useCancelarReservas } from "./hooks/useCancelarReservas";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Huesped = {
  id: number;
  nombre?: string;
  apellido?: string;
};

export default function CancelarReservaPage() {
  const router = useRouter();
  const apellidoRef = useRef<HTMLInputElement | null>(null);
  const nombreRef = useRef<HTMLInputElement | null>(null);

  const [apellido, setApellido] = useState("");
  const [nombre, setNombre] = useState("");

  const [loading, setLoading] = useState(false);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [selectedHuesped, setSelectedHuesped] = useState<Huesped | null>(null);
  const [reservas, setReservas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [idsToCancel, setIdsToCancel] = useState<number[]>([]);

  const { cancelarMultiples } = useCancelarReservas();

  // ============================================================
  // Lógica de Búsqueda/Cancelación (Sin Cambios en funcionalidad)
  // ============================================================

  const buscarHuespedes = async () => {
    setError(null);
    setInfoMsg(null);
    if (!apellido || apellido.trim() === "") {
      setError("El campo Apellido no puede estar vacío");
      apellidoRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("apellido", apellido.trim());
      if (nombre) params.set("nombre", nombre.trim());
      const res = await fetch(`${API_URL}/api/huespedes/buscar?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 404) {
          const body = await res.json().catch(() => null);
          setHuespedes([]);
          setReservas([]);
          setInfoMsg(body?.message || "No existen reservas para los criterios de búsqueda");
          apellidoRef.current?.focus();
        } else {
          throw new Error(await res.text());
        }
        setLoading(false);
        return;
      }
      const body = await res.json();
      const resultados = body?.data ?? body;
      if (!Array.isArray(resultados) || resultados.length === 0) {
        setHuespedes([]);
        setReservas([]);
        setInfoMsg("No existen reservas para los criterios de búsqueda");
        apellidoRef.current?.focus();
        setLoading(false);
        return;
      }
      setHuespedes(resultados);
      setSelectedHuesped(resultados[0]);
      await cargarReservasPorHuesped(resultados[0].id);
    } catch (err: any) {
      setError("Error al buscar huéspedes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarReservasPorHuesped = async (idHuesped: number) => {
    setLoading(true);
    setError(null);
    setInfoMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/reservas/huesped/${idHuesped}`);
      if (!res.ok) throw new Error(await res.text());
      const reservasData = await res.json();
      if (reservasData.length === 0) {
        setInfoMsg("No existen reservas para los criterios de búsqueda");
        apellidoRef.current?.focus();
      }
      setReservas(reservasData);
    } catch (err: any) {
      setError("Error al cargar reservas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSelectHuesped = async (h: Huesped) => {
    setSelectedHuesped(h);
    cargarReservasPorHuesped(h.id);
  };
  
  const handleContinuar = () => {
    setInfoMsg(null);
    setError(null);
    apellidoRef.current?.focus(); 
  }

  const onAceptar = (ids: number[]) => {
    if (!ids || ids.length === 0) {
      setError("Debe seleccionar al menos una reserva para cancelar.");
      return;
    }
    setIdsToCancel(ids);
    setShowConfirmCancelModal(true);
  };

  const ejecutarCancelacion = async () => {
    setShowConfirmCancelModal(false);
    const ids = idsToCancel;
    setLoading(true);
    setError(null);

    try {
      const result = await cancelarMultiples(ids);
      if (result?.canceladas > 0) {
        setInfoMsg(`${result.canceladas} reserva(s) cancelada(s). PRESIONE CONTINUAR...`);
        setReservas(prev => prev.filter(r => !ids.includes(r.id)));
      } else {
         setError(result?.message || "No se cancelaron reservas.");
      }
    } catch (err: any) {
      setError("Error al cancelar reservas: " + err.message);
    } finally {
      setLoading(false);
      setIdsToCancel([]);
    }
  };

  const onCancelar = (clearSelectionCallback?: () => void) => {
    if (clearSelectionCallback) clearSelectionCallback();
    setError(null);
    setInfoMsg(null);
    setShowCancelModal(true);
  };

  const confirmarVolverMenu = () => {
    setShowCancelModal(false);
    router.push("/principal"); 
  };

  const cancelarVolverMenu = () => {
    setShowCancelModal(false);
  };
  
  const cancelarConfirmacionReserva = () => {
    setShowConfirmCancelModal(false);
    setIdsToCancel([]);
  };

  const limpiarBusqueda = () => {
    setApellido("");
    setNombre("");
    setHuespedes([]);
    setReservas([]);
    setSelectedHuesped(null);
    setError(null);
    setInfoMsg(null);
    apellidoRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-4 md:p-8">
      
      {/* Contenedor principal blanco */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Título Principal con fondo azul */}
        <div className="bg-blue-800 text-white px-6 py-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            CU06 — Cancelar Reserva
          </h1>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          {/* SECCIÓN DE BÚSQUEDA - Fondo Azul Claro */}
          <div className="bg-blue-100 p-5 rounded-lg shadow-sm mb-6 border border-blue-200">
            <h2 className="font-semibold mb-4 text-xl text-gray-800 border-b border-blue-300 pb-2">
              Buscar Reservas
            </h2>

            {/* Formulario de búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500">*</span> Apellido
                </label>
                <input
                  ref={apellidoRef}
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && buscarHuespedes()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                           transition duration-200 uppercase"
                  placeholder="Ingrese apellido..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  ref={nombreRef}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && buscarHuespedes()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                           transition duration-200 uppercase"
                  placeholder="Ingrese nombre..."
                />
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={buscarHuespedes}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                           px-6 py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 
                           transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Buscando...
                    </>
                  ) : "Buscar"}
                </button>

                <button
                  onClick={limpiarBusqueda}
                  className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 
                           px-5 py-3 rounded-lg shadow hover:from-gray-400 hover:to-gray-500 
                           transition duration-200 font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Mensajes de Error y Éxito */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {infoMsg && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{infoMsg}</span>
                </div>
                <button 
                  onClick={handleContinuar}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 
                           transition duration-200 font-medium shadow-sm"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* RESULTADOS - Contenedor Blanco con borde */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-4 text-gray-800">
              <span className="font-medium text-lg">Huéspedes encontrados: </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full ml-2 font-bold">
                {huespedes.length}
              </span>
            </div>

            {huespedes.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione un huésped</label>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <select
                    value={selectedHuesped?.id ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const h = huespedes.find((x) => x.id === id);
                      if (h) onSelectHuesped(h);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 
                             text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 
                             focus:ring-blue-200 focus:outline-none transition duration-200"
                  >
                    {huespedes.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.apellido}, {h.nombre}
                      </option>
                    ))}
                  </select>
                  
                  {selectedHuesped && (
                    <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded border border-gray-200">
                      <span className="font-medium">Seleccionado:</span> {selectedHuesped.apellido}, {selectedHuesped.nombre}
                    </div>
                  )}
                </div>
              </div>
            )}

            <ReservationGrid
              reservas={reservas}
              loading={loading}
              onAceptar={onAceptar}
              onCancelar={onCancelar}
            />
          </div>
        </div>

        {/* Pie de página */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-gray-600 text-sm">
          Sistema de Gestión Hotelera - Cancelar Reserva
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Confirmación de CANCELACIÓN DE RESERVA */}
      {/* ========================================================================= */}
      {showConfirmCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border-t-4 border-red-600">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Confirmar Cancelación
                </h3>
              </div>
              
              <p className="text-gray-700 mb-2">
                ¿Está seguro que desea cancelar <span className="font-bold text-red-600">{idsToCancel.length} reserva(s)</span> seleccionada(s)?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelarConfirmacionReserva}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 
                           transition duration-200 font-medium shadow-sm"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={ejecutarCancelacion}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg 
                           hover:from-red-700 hover:to-red-800 transition duration-200 font-medium shadow-sm"
                >
                  ACEPTAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Confirmación para VOLVER AL MENÚ */}
      {/* ========================================================================= */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border-t-4 border-blue-600">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Volver al Menú Principal
                </h3>
              </div>
              
              <p className="text-gray-700 mb-2">
                ¿Está seguro que desea volver al menú principal?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Se perderán los resultados de búsqueda y selecciones actuales.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelarVolverMenu}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 
                           transition duration-200 font-medium shadow-sm"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={confirmarVolverMenu}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg 
                           hover:from-blue-700 hover:to-blue-800 transition duration-200 font-medium shadow-sm"
                >
                  Volver al Menú
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}