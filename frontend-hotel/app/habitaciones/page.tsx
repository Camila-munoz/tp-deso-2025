"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones, crearEstadia } from "@/services/api";
import Grilla from "@/components/habitaciones/Grilla";
import ModalOcupar from "@/components/habitaciones/ModalOcupar";
import Link from "next/link";

export default function EstadoPage() {
  // ... (Mismos estados de fecha y datos)
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<any>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Interacción
  const [celda, setCelda] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getHabitaciones().then(res => setHabitaciones(res.sort((a:any, b:any) => parseInt(a.numero)-parseInt(b.numero))));
  }, []);

  const handleBuscar = async () => {
     // ... (misma lógica de búsqueda)
     const res = await getEstadoHabitaciones(fechaDesde, fechaHasta);
     if(res.success) {
        const mapa: any = {};
        res.data.forEach((i:any) => mapa[`${i.idHabitacion}_${i.fecha}`] = i.estado);
        setEstados(mapa);
        setBusquedaRealizada(true);
     }
  };

  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    const estado = estados[`${hab.id}_${fechaIso}`] || "LIBRE";
    if(estado === "OCUPADA") return alert("Habitación Ocupada");
    
    // Aquí SIEMPRE abrimos el modal de Ocupar (porque estamos en la sección Ocupar)
    setCelda({ idHab: hab.id, numero: hab.numero, estado, fechaIso });
    setModalOpen(true);
  };

  const handleOcupar = async (datos: any) => {
    try {
        await crearEstadia({
            idHabitacion: celda.idHab,
            idHuespedTitular: datos.idHuespedTitular,
            idsAcompañantes: datos.idsAcompañantes,
            cantidadDias: datos.dias,
            cantidadHuespedes: 1 + datos.idsAcompañantes.length,
            idReserva: null
        });
        alert("✅ Check-in exitoso");
        setModalOpen(false);
        handleBuscar();
    } catch(e:any) { alert(e.message); }
  };

  // Helpers
  const getDias = () => { /* ... misma lógica de días ... */ 
      const start = new Date(fechaDesde+"T00:00:00"); const end = new Date(fechaHasta+"T00:00:00");
      const dias = []; const diff = Math.ceil((end.getTime()-start.getTime())/86400000);
      for(let i=0; i<=diff; i++){
          const d = new Date(start); d.setDate(d.getDate()+i);
          dias.push({label:`${d.getDate()}/${d.getMonth()+1}`, iso:d.toISOString().split('T')[0], index:i});
      }
      return dias;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
        <div className="absolute top-4 left-4"><Link href="/">⬅ Volver</Link></div>
        <h1 className="text-3xl text-center font-bold text-red-800 mb-4">OCUPAR HABITACIÓN (CU15)</h1>
        
        <div className="flex justify-center gap-4 mb-4 bg-white p-4 rounded shadow">
            <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="border p-1"/>
            <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="border p-1"/>
            <button onClick={handleBuscar} className="bg-blue-500 text-white px-4 rounded font-bold">Consultar</button>
        </div>

        {busquedaRealizada && (
            <div className="bg-white border border-gray-400">
                <Grilla 
                    habitaciones={habitaciones} 
                    estados={estados} 
                    dias={getDias()} 
                    onCellClick={handleCellClick} 
                    seleccionInicio={null} // En Ocupar no hacemos rango, click directo
                    carrito={[]} 
                />
            </div>
        )}

        <ModalOcupar 
            isOpen={modalOpen}
            onClose={()=>setModalOpen(false)}
            onConfirm={handleOcupar}
            habitacionNumero={celda?.numero}
            estadoActual={celda?.estado}
            diasDefault={1}
            // Le pasamos la fecha de inicio para calcular días si hubiera rango, 
            // pero aquí es simple.
            fechaInicio={celda?.fechaIso}
            fechaFin={celda?.fechaIso} 
        />
    </div>
  );
}