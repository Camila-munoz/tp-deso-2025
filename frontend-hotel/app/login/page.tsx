"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans text-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-10 w-full max-w-md relative overflow-hidden"
      >
        {/* Decoración Fondo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 shadow-sm">
            <User className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido</h1>
          <p className="text-gray-500 text-sm mt-1">Inicie sesión para acceder al sistema</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-medium"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Usuario</label>
            <div className="relative">
                <User className="absolute left-4 top-3 text-gray-400" size={18}/>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingrese su nombre"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white"
                />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Contraseña</label>
            <div className="relative">
                <Lock className="absolute left-4 top-3 text-gray-400" size={18}/>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white"
                />
            </div>
          </div>
        </div>

        {/* Botón */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={autenticar}
          disabled={loading}
          className="w-full mt-8 py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20}/> : "Ingresar"}
          {!loading && <ArrowRight size={20} />}
        </motion.button>

        {/* Nota final */}
        <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
          La contraseña debe tener al menos 5 letras y 3 números (no consecutivos).
        </p>
      </motion.div>
      
      <div className="absolute bottom-6 text-center text-gray-400 text-xs">
        © 2025 Hotel Premier - Sistema de Gestión
      </div>
    </div>
  );
}