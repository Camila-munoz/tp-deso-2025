"use client";
import { useState } from "react";
import { buscarHuespedes } from "@/services/api";

interface Props {
  onSeleccionar: (huesped: any) => void;
}

export default function HuespedSelector({ onSeleccionar }: Props) {
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleBuscar = async () => {
    setBuscando(true);
    setMensaje("");
    setResultados([]);
    try {
      const res = await buscarHuespedes({ apellido, numDoc: dni });
      if (res.success && res.data.length > 0) {
        setResultados(res.data);
      } else {
        setMensaje("No se encontraron personas.");
      }
    } catch (e) {
      setMensaje("Error de conexión.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="bg-gray-50 p-3 rounded border border-gray-300">
      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Buscar en Padrón:</h4>
      <div className="flex gap-2 mb-2">
        <input 
          placeholder="APELLIDO" 
          className="border p-1 w-full rounded text-sm uppercase"
          value={apellido} 
          onChange={e => setApellido(e.target.value.toUpperCase())} // Requisito: Mayúsculas
        />
        <input 
          placeholder="DNI" 
          className="border p-1 w-full rounded text-sm"
          value={dni} 
          onChange={e => setDni(e.target.value)}
        />
        <button onClick={handleBuscar} disabled={buscando} className="bg-blue-600 text-white px-3 rounded font-bold text-xs">
          {buscando ? "..." : "🔍"}
        </button>
      </div>

      {resultados.length > 0 && (
        <div className="max-h-32 overflow-y-auto bg-white border rounded">
          {resultados.map((h) => (
            <div key={h.id} className="p-2 border-b hover:bg-blue-50 cursor-pointer flex justify-between items-center" onClick={() => onSeleccionar(h)}>
              <span className="text-sm font-bold">{h.apellido}, {h.nombre}</span>
              <span className="text-xs text-gray-500">{h.numeroDocumento}</span>
            </div>
          ))}
        </div>
      )}
      {mensaje && <p className="text-xs text-center text-red-500 mt-1">{mensaje}</p>}
    </div>
  );
}