"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones, crearEstadia } from "@/services/api";
import Grilla from "@/components/habitaciones/Grilla";
import ModalConflicto from "@/components/habitaciones/ModalConflicto";
import ModalCargaHuespedes from "@/components/habitaciones/ModalCargaHuespedes";
import Link from "next/link";

export default function OcuparPage() {
  // Estados Fecha
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  
  // Estados Datos
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Estados Selección
  const [celda, setCelda] = useState<any>(null); // { idHab, numero, fechaIso, estado }
  
  // Estados Modales
  const [mostrarConflicto, setMostrarConflicto] = useState(false);
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  useEffect(() => {
    getHabitaciones().then(res => setHabitaciones(res.sort((a:any, b:any) => parseInt(a.numero)-parseInt(b.numero))));
  }, []);

  const handleBuscar = async () => {
    setCargando(true);
    try {
      const res = await getEstadoHabitaciones(fechaDesde, fechaHasta);
      if(res.success) {
        const mapa: any = {};
        res.data.forEach((i:any) => mapa[`${i.idHabitacion}_${i.fecha}`] = i.estado);
        setEstados(mapa);
        setBusquedaRealizada(true);
      }
    } catch(e) { alert("Error conectando."); } finally { setCargando(false); }
  };

  // --- LÓGICA DE CLICK (CU15 Punto 3) ---
  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    const key = `${hab.id}_${fechaIso}`;
    const estado = estados[key] || "LIBRE";

    if (estado === "OCUPADA" || estado === "FUERA_DE_SERVICIO") {
        return alert("La habitación no está disponible para ocupación.");
    }

    setCelda({ idHab: hab.id, numero: hab.numero, fechaIso, estado });

    // Flujo Alternativo 3.D (Reservada)
    if (estado === "RESERVADA") {
        setMostrarConflicto(true);
    } else {
        // Flujo Principal (Libre) -> Vamos a cargar huéspedes
        setMostrarCarga(true);
    }
  };

  // Submit Final (Punto 12)
  const handleConfirmarOcupacion = async (titularId: number, acompanantesIds: number[], dias: number) => {
    try {
        await crearEstadia({
            idHabitacion: celda.idHab,
            idHuespedTitular: titularId,
            idsAcompañantes: acompanantesIds,
            cantidadDias: dias,
            cantidadHuespedes: 1 + acompanantesIds.length,
            idReserva: null
        });
        setMostrarCarga(false);
        setMostrarExito(true);
        handleBuscar(); // Refrescar grilla
    } catch(e: any) { alert("Error: " + e.message); }
  };

  // Helpers render
  const getDias = () => {
      const start = new Date(fechaDesde+"T00:00:00"); const end = new Date(fechaHasta+"T00:00:00");
      const dias = []; const diff = Math.ceil((end.getTime()-start.getTime())/86400000);
      for(let i=0; i<=diff; i++){
          const d = new Date(start); d.setDate(d.getDate()+i);
          dias.push({label:`${d.getDate()}/${d.getMonth()+1}`, iso:d.toISOString().split('T')[0], index:i});
      }
      return dias;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
       <div className="absolute top-6 left-6">
        <Link href="/" className="text-gray-500 hover:text-red-800 font-bold flex items-center gap-1"><span>⬅</span> MENÚ</Link>
       </div>

       <h1 className="text-4xl text-center text-red-900 font-bold mb-8 font-serif tracking-widest border-b-2 border-red-200 pb-4 px-10 mt-2">
        OCUPAR HABITACIÓN (CU15)
       </h1>

       {/* FILTROS */}
       <div className="bg-white px-10 py-6 rounded-xl shadow-md border border-gray-200 flex items-end gap-8 mb-8">
          <div className="flex flex-col">
            <label className="font-bold text-sm uppercase">Desde</label>
            <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="border-2 p-2 rounded-lg text-gray-700"/>
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm uppercase">Hasta</label>
            <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="border-2 p-2 rounded-lg text-gray-700"/>
          </div>
          <button onClick={handleBuscar} className="bg-red-800 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-red-900 shadow-md">
             {cargando ? "..." : "BUSCAR"}
          </button>
       </div>

       {/* GRILLA */}
       {busquedaRealizada && (
          <div className="w-full max-w-[95%] bg-white shadow-xl border border-gray-300 rounded-lg overflow-hidden mb-10">
             <Grilla 
                habitaciones={habitaciones} 
                estados={estados} 
                dias={getDias()} 
                onCellClick={handleCellClick} 
                seleccionInicio={null} // En Ocupar no arrastramos rango, es click puntual
                carrito={[]} 
             />
             <div className="flex justify-center gap-8 py-4 bg-gray-50 border-t">
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#f87171] border border-gray-400"></div><span>Ocupado</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#d9f99d] border border-gray-400"></div><span>Disponible</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#fef08a] border border-gray-400"></div><span>Reservado</span></div>
             </div>
          </div>
       )}

       {/* --- MODALES --- */}
       <ModalConflicto 
          isOpen={mostrarConflicto}
          onClose={() => setMostrarConflicto(false)}
          onOcuparIgual={() => { setMostrarConflicto(false); setMostrarCarga(true); }}
          habitacionNumero={celda?.numero}
          fecha={celda?.fechaIso}
       />

       <ModalCargaHuespedes 
          isOpen={mostrarCarga}
          onClose={() => setMostrarCarga(false)}
          onConfirm={handleConfirmarOcupacion}
          habitacionNumero={celda?.numero}
       />

       {/* MODAL DE ÉXITO */}
       {mostrarExito && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in">
             <div className="bg-white p-10 rounded-xl shadow-2xl text-center border-b-8 border-green-500 w-[500px]">
                 <div className="text-6xl mb-4">✅</div>
                 <h2 className="text-2xl font-bold text-gray-800">Check-in Exitoso</h2>
                 <p className="text-gray-500 mb-6">La habitación ha sido ocupada y los huéspedes registrados.</p>
                 <button onClick={()=>setMostrarExito(false)} className="bg-blue-600 text-white px-8 py-2 rounded font-bold w-full hover:bg-blue-700">CONTINUAR</button>
             </div>
        </div>
       )}
    </div>
  );
}