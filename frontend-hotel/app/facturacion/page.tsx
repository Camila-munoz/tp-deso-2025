// app/facturacion/page.tsx
"use client";

import FacturacionComponent from './components/FacturacionForm';

export default function FacturacionPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Facturación - Hotel Premier</h1>
          <p className="text-gray-600 mt-2">Caso de Uso 07: Facturar</p>
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