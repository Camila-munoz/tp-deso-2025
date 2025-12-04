"use client";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onContinue: () => void;
}

export default function ModalIntermedio({ isOpen, onContinue }: Props) {
  useEffect(() => {
    if (isOpen) {
      const handleInput = () => onContinue();
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
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center cursor-pointer">
      <div className="bg-gray-300 border-4 border-gray-500 p-10 rounded-lg shadow-2xl text-center w-[600px] animate-pulse">
        <h2 className="text-3xl font-serif font-bold text-black mb-4">Habitaciones Bloqueadas</h2>
        <p className="text-blue-700 font-bold text-xl uppercase tracking-widest">
            PRESIONE CUALQUIER TECLA Y CONTINUA...
        </p>
      </div>
    </div>
  );
}