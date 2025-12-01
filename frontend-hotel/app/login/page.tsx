"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function LoginPage() {
  const [nombre, setNombre] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const autenticar = async () => {
    setError("");
    if (!nombre.trim() || !contrasena.trim()) {
      setError("Debe completar todos los campos");
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/conserjes/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, contrasena }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        // Manejo seguro del error
        const msg = data?.message || "El usuario o la contraseña no son válidos";
        setError(msg);
        // Blanquear campos según CU
        setNombre("");
        setContrasena("");
        return;
      }

      // Login exitoso: guardamos algo básico y redirigimos
      // Podés adaptar esto para guardar token/session
      sessionStorage.setItem("usuario", data?.usuario ?? nombre);
      router.push("/principal");
    } catch (err: unknown) {
      // Tipado seguro para err
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Iniciar sesión</h1>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">👤</div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <label className="block mb-3 text-sm text-gray-700">
          <span className="block font-medium mb-1">Nombre</span>
          <input
            type="text"
            value={nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
            placeholder="Ingrese su nombre"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </label>

        <label className="block mb-4 text-sm text-gray-700">
          <span className="block font-medium mb-1">Contraseña</span>
          <input
            type="password"
            value={contrasena}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
            placeholder="Ingrese su contraseña"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </label>

        <button
          onClick={autenticar}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Recuerde que la contraseña debe tener al menos 5 letras y 3 números (No consecutivos).
        </p>
      </div>
    </div>
  );
}
