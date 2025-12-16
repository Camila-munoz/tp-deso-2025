"use client";

import { useRouter } from "next/navigation";
import FacturacionComponent from "./components/FacturacionForm";

export default function FacturacionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative">
      
      {/* BOTÓN VOLVER AL MENÚ PRINCIPAL */}
      <button
        onClick={() => router.push("/principal")}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-red-500 border-2 border-black
                   flex items-center justify-center text-white font-bold
                   hover:bg-red-600 shadow-md"
        title="Volver al menú principal"
      >
        X
      </button>

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Sistema de Facturación - Hotel Premier
          </h1>
          <p className="text-gray-600 mt-2">
            Caso de Uso 07: Facturar
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <FacturacionComponent />
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Diseño de Sistemas - TP 2025</p>
          <p>Hotel Premier - Santa Fe</p>
        </footer>
      </div>
    </div>
  );
}
