"use client";

import { label } from "framer-motion/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrincipalPage() {
  const router = useRouter();

  useEffect(() => {
    const usuario = sessionStorage.getItem("usuario");
    if (!usuario) {
      router.push("/");
    }
  }, []);

  const opciones = [
    { label: "Buscar Huésped", path: "/huespedes" },
    { label: "Crear Huésped", path: "/huespedes/nuevo" },
    { label: "Crear Reserva", path: "/reservas" },
    {label: "Ocupar Habitación", path: "/ocupar" },
    { label: "Cancelar Reserva", path: "/cancelar-reserva" },
    { label: "Facturar", path: "/facturacion" },
    { label: "Dar de baja Huésped", path: "/huespedes/baja" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md text-lg transition"
            >
              {op.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem("usuario");
            router.push("/");
          }}
          className="mt-8 w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
