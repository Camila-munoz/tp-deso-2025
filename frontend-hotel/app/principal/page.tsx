"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Importamos iconos modernos
import { Users, UserPlus, CalendarDays, Key, XCircle, Receipt, LogOut } from "lucide-react";

export default function PrincipalPage() {
  const router = useRouter();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    const usuario = sessionStorage.getItem("usuario");
    if (!usuario) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    router.push("/login"); 
  };

  // Opciones con iconos
  const opciones = [
    { label: "Buscar Huésped", path: "/huespedes", icon: Users, color: "bg-blue-500" },
    { label: "Nuevo Huésped", path: "/huespedes/nuevo", icon: UserPlus, color: "bg-emerald-500" },
    { label: "Reservar Habitación", path: "/reservas", icon: CalendarDays, color: "bg-violet-500" },
    { label: "Ocupar Habitación", path: "/ocupar", icon: Key, color: "bg-amber-500" },
    { label: "Cancelar Reserva", path: "/cancelar-reserva", icon: XCircle, color: "bg-rose-500" },
    { label: "Facturar", path: "/facturacion", icon: Receipt, color: "bg-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Panel de Control
            </h1>
            <p className="text-gray-500 text-lg">Sistema de Gestión Hotelera</p>
        </div>

        {/* GRID DE OPCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {opciones.map((op) => (
            <button
              key={op.path}
              onClick={() => router.push(op.path)}
              className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${op.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <op.icon size={28} strokeWidth={2} />
              </div>
              <span className="text-lg font-bold text-gray-800 group-hover:text-gray-900">
                {op.label}
              </span>
              <span className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Acceder
              </span>
            </button>
          ))}
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
        <div className="flex justify-center">
            <button
              onClick={() => setMostrarConfirmacion(true)}
              className="flex items-center gap-2 px-6 py-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
              Cerrar Sesión
            </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 text-center text-gray-400 text-xs">
        © 2025 Hotel Premier
      </div>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[400px] text-center relative">
            
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Cerrar Sesión?
            </h3>
            
            <p className="text-gray-500 mb-8 text-sm">
              Serás redirigido a la pantalla de ingreso.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}