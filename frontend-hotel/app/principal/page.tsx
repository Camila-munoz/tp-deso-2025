"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrincipalPage() {
  const router = useRouter();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    const usuario = sessionStorage.getItem("usuario");
    if (!usuario) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    router.push("/login"); 
  };

  const opciones = [
    { label: "Buscar Huésped", path: "/huespedes" },
    { label: "Dar de alta Huésped", path: "/huespedes/nuevo" },
    { label: "Reservar Habitación", path: "/reservas" },
    {label: "Ocupar Habitación", path: "/ocupar" },
    { label: "Cancelar Reserva", path: "/cancelar-reserva" },
    { label: "Facturar", path: "/facturacion" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8 font-sans relative">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Menú Principal
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          Seleccione un Caso de Uso
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opciones.map((op) => (
            <button
              key={op.path}
              onClick={() => router.push(op.path)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md text-lg transition active:scale-95"
            >
              {op.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setMostrarConfirmacion(true)}
          className="mt-8 w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow font-bold"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* --- MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN --- */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl border-t-8 border-red-500 w-[450px] text-center transform transition-all scale-100">
            
            <div className="text-5xl mb-4">🚪</div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2 font-serif">
              ¿Cerrar Sesión?
            </h3>
            
            <p className="text-gray-500 mb-8">
              ¿Estás seguro que deseas salir del sistema?
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition w-32"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg transition w-32"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}