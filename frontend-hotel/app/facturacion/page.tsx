"use client";

import Link from "next/link";
import FacturacionComponent from "./components/FacturacionForm";
import { ArrowLeft } from "lucide-react";

export default function FacturacionPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      
      <div className="max-w-5xl mx-auto">
        
        {/* BOTÓN VOLVER (Estilo Cancelar Reserva) */}
        <div className="w-full mb-8 flex items-center justify-between">
             <Link href="/principal" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <ArrowLeft size={20} />
                </div>
                <span>Volver al Menú</span>
             </Link>
        </div>

        {/* TÍTULO */}
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Facturación
            </h1>
            <p className="text-gray-500 mt-1">
              Gestión de cobros y emisión de comprobantes (CU07)
            </p>
        </div>

        {/* CONTENEDOR DEL COMPONENTE */}
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <FacturacionComponent />
        </div>

        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2025 Hotel Premier - Sistema de Gestión</p>
          <p className="text-xs mt-1 opacity-70">Diseño de Sistemas - TP Final</p>
        </footer>
      </div>
    </div>
  );
}