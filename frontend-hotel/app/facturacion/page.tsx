"use client";
import { useState } from "react";
import { previsualizarFactura, confirmarFactura } from "@/services/api";

export default function FacturacionPage() {
  const [idEstadia, setIdEstadia] = useState("");
  const [previsualizacion, setPrevisualizacion] = useState<any>(null);
  const [error, setError] = useState("");

  const handlePrevisualizar = async () => {
    try {
      setError("");
      const data = await previsualizarFactura(Number(idEstadia));
      setPrevisualizacion(data);
    } catch (err: any) {
      setError("No se pudo obtener la estadía. Verifique el ID.");
      setPrevisualizacion(null);
    }
  };

  const handleConfirmar = async () => {
    if (!previsualizacion) return;

    const facturaPayload = {
      monto: previsualizacion.total,
      tipo: previsualizacion.tipoFactura,
      estado: "PENDIENTE",
      estadia: { id: Number(idEstadia) },
      responsable: { id: 1 } // NOTA: Aquí deberías permitir seleccionar el responsable real
    };

    try {
      const res = await confirmarFactura(facturaPayload);
      if (res.success) {
        alert(`✅ Factura creada! ID: ${res.id}`);
        setPrevisualizacion(null);
        setIdEstadia("");
      }
    } catch (err) {
      alert("Error al crear la factura");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Facturación (CU07)</h1>

      {/* Paso 1: Ingresar ID Estadía */}
      <div className="flex gap-4 mb-6">
        <input
          type="number"
          placeholder="ID de Estadía"
          className="border p-2 rounded w-full"
          value={idEstadia}
          onChange={(e) => setIdEstadia(e.target.value)}
        />
        <button 
          onClick={handlePrevisualizar}
          className="bg-indigo-600 text-white px-6 py-2 rounded font-medium"
        >
          Ver Detalle
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Paso 2: Mostrar Previsualización (Map del Backend) */}
      {previsualizacion && (
        <div className="border rounded-lg p-6 bg-white shadow-lg">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">Huésped: {previsualizacion.huesped}</h2>
            <p className="text-gray-500">Tipo Factura: <span className="font-bold text-black">{previsualizacion.tipoFactura}</span></p>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="text-left text-gray-500">
                <th>Concepto</th>
                <th className="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {previsualizacion.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2">{item.concepto}</td>
                  <td className="py-2 text-right">${item.monto.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center text-xl font-bold bg-gray-50 p-4 rounded">
            <span>Total a Pagar:</span>
            <span>${previsualizacion.total.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleConfirmar}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition"
          >
            CONFIRMAR Y EMITIR FACTURA
          </button>
        </div>
      )}
    </div>
  );
}