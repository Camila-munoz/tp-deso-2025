"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function LoginPage() {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(data?.message || "El usuario o la contraseña no son válidos");
        setNombre("");
        setContrasena("");
        return;
      }

      sessionStorage.setItem("usuario", nombre);
      router.push("/principal");
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-xl bg-white/60 shadow-2xl border border-gray-200 rounded-3xl p-10 w-full max-w-md"
      >
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Iniciar sesión</h1>

          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="text-indigo-600" size={24} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
           <input
  type="text"
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
  placeholder="Ingrese su nombre"
  className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2
             focus:ring-2 focus:ring-indigo-400 focus:outline-none 
             shadow-sm transition
             placeholder-gray-600 text-gray-800"
/>


          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
  type="password"
  value={contrasena}
  onChange={(e) => setContrasena(e.target.value)}
  placeholder="Ingrese su contraseña"
  className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2
             focus:ring-2 focus:ring-indigo-400 focus:outline-none 
             shadow-sm transition
             placeholder-gray-600 text-gray-800"
/>


          </div>
        </div>

        {/* Botón */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={autenticar}
          disabled={loading}
          className="w-full mt-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 disabled:opacity-60 transition"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </motion.button>

        {/* Nota final */}
        <p className="mt-4 text-center text-xs text-gray-500">
          La contraseña debe tener al menos 5 letras y 3 números (no consecutivos).
        </p>
      </motion.div>
    </div>
  );
}
