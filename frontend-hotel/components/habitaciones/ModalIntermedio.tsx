"use client";
import { useEffect } from "react";
// Icono de bloqueo moderno
import { Lock } from "lucide-react";

interface Props {
  isOpen: boolean;
  onContinue: () => void;
}

export default function ModalIntermedio({ isOpen, onContinue }: Props) {
  useEffect(() => {
    if (isOpen) {
      const handleInput = () => onContinue();
      // Detectamos cualquier interacción para continuar
      window.addEventListener("keydown", handleInput);
      window.addEventListener("click", handleInput);
      return () => {
        window.removeEventListener("keydown", handleInput);
        window.removeEventListener("click", handleInput);
      };
    }
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  return (
    // Fondo oscuro con blur para efecto modal moderno
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center cursor-pointer animate-in fade-in">
      
      {/* Contenedor limpio y centrado */}
      <div className="text-center animate-pulse flex flex-col items-center">
        
        {/* Icono grande y estilizado */}
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 backdrop-blur-md shadow-2xl">
            <Lock className="text-white w-10 h-10 opacity-90" />
        </div>

        {/* Texto principal */}
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
          Habitaciones Bloqueadas
        </h2>

        {/* Instrucción secundaria */}
        <p className="text-indigo-200 font-medium text-lg uppercase tracking-wider bg-black/20 px-6 py-2 rounded-full border border-white/10">
           Presione cualquier tecla para continuar...
        </p>
      </div>
    </div>
  );
}