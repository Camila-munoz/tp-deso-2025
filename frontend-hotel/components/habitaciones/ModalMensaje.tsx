"use client";

interface Props {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  tipo?: "ERROR" | "EXITO" | "INFO";
  onClose: () => void;
}

export default function ModalMensaje({ isOpen, titulo, mensaje, tipo = "INFO", onClose }: Props) {
  if (!isOpen) return null;

  const colorBorder = tipo === "ERROR" ? "border-red-500" : tipo === "EXITO" ? "border-green-500" : "border-blue-500";
  const colorText = tipo === "ERROR" ? "text-red-600" : tipo === "EXITO" ? "text-green-600" : "text-blue-600";
  const colorBtn = tipo === "ERROR" ? "bg-red-600 hover:bg-red-700" : tipo === "EXITO" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-in fade-in duration-200">
      <div className={`bg-white p-8 rounded-xl shadow-2xl text-center border-b-8 ${colorBorder} w-[450px] transform transition-all scale-100`}>
        <h2 className={`text-2xl font-bold ${colorText} mb-4`}>{titulo}</h2>
        <p className="text-gray-700 text-lg mb-8 leading-relaxed">{mensaje}</p>
        <button
          onClick={onClose}
          className={`${colorBtn} text-white px-8 py-3 rounded-lg font-bold w-full transition-colors shadow-md`}
        >
          ACEPTAR
        </button>
      </div>
    </div>
  );
}