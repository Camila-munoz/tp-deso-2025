"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones, crearEstadia } from "@/services/api";
import Grilla from "@/components/habitaciones/Grilla";
import ModalConflicto from "@/components/habitaciones/ModalConflicto";
import ModalIntermedio from "@/components/habitaciones/ModalIntermedio";
import ModalCargaHuespedes from "@/components/habitaciones/ModalCargaHuespedes";
import ModalOpciones from "@/components/habitaciones/ModalOpciones";
import Link from "next/link";

export default function OcuparPage() {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [fechaDesde, setFechaDesde] = useState(today);
  const [fechaHasta, setFechaHasta] = useState(nextWeek);
  
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);

  // --- ESTADOS DEL PROCESO (CARRITO VISUAL) ---
  const [clickInicio, setClickInicio] = useState<any>(null);
  // Aquí guardamos los rangos seleccionados. Se pintarán de rojo VISUALMENTE, no en BD.
  const [itemsPendientes, setItemsPendientes] = useState<any[]>([]); 
  
  // --- ESTADOS DE DATOS FINALES (MEMORIA) ---
  const [datosFinales, setDatosFinales] = useState<any[]>([]); // Acumula {idHab, huespedes...} para guardar al final

  // Control de Modales
  const [itemProcesando, setItemProcesando] = useState<any>(null);
  const [indiceProcesando, setIndiceProcesando] = useState(0);
  const [modal, setModal] = useState<"NONE" | "CONFLICTO" | "INTERMEDIO" | "CARGA" | "OPCIONES" | "EXITO">("NONE");

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
            setClickInicio(null); setItemsPendientes([]); setDatosFinales([]);
        }
    } catch(e) {} finally { setCargando(false); }
  };

  // --- 1. SELECCIÓN EN GRILLA (CARRITO) ---
  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    const key = `${hab.id}_${fechaIso}`;
    const estado = estados[key] || "LIBRE";

    // Validación inicial
    if(estado === "OCUPADA" || estado === "FUERA_DE_SERVICIO") return alert("Habitación ocupada.");

    // --- SELECCIÓN DE RANGO (EFECTO AZUL Y LUEGO ROJO) ---
    if (!clickInicio) {
        setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso }); // Pinta Azul (Grilla lo maneja)
    } else {
        if (clickInicio.idHab !== hab.id) { setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso }); return; }
        
        const d1 = new Date(clickInicio.fechaIso); const d2 = new Date(fechaIso);
        const inicio = d1<d2 ? clickInicio.fechaIso : fechaIso;
        const fin = d1<d2 ? fechaIso : clickInicio.fechaIso;
        const dias = Math.ceil(Math.abs(d2.getTime()-d1.getTime())/86400000)+1;

        // Validar ocupación en el medio
        let fIter = new Date(inicio);
        const fEnd = new Date(fin);
        let esReservada = false;
        let fechaConflicto = "";

        while(fIter <= fEnd) {
            const iso = fIter.toISOString().split('T')[0];
            const st = estados[`${hab.id}_${iso}`] || "LIBRE";
            if(st === "OCUPADA") { setClickInicio(null); return alert("Rango ocupado."); }
            if(st === "RESERVADA") { esReservada = true; fechaConflicto = iso; }
            fIter.setDate(fIter.getDate()+1);
        }

        // Agregar a Pendientes (Esto pintará de ROJO visualmente gracias a getGrillaCarrito)
        const nuevoItem = { 
            idHab: hab.id, numero: hab.numero, inicio, fin, dias, 
            estadoOriginal: esReservada ? "RESERVADA" : "LIBRE",
            fechaConflicto
        };
        setItemsPendientes([...itemsPendientes, nuevoItem]);
        setClickInicio(null);
    }
  };

  // --- 2. INICIAR PROCESO (Punto 3 del flujo) ---
  // Al apretar "INICIAR", recorremos los items pendientes
  const iniciarProceso = () => {
      if (itemsPendientes.length === 0) return;
      procesarItem(0);
  };

  const procesarItem = (index: number) => {
      if (index >= itemsPendientes.length) {
          // Se terminaron los items -> Guardamos Todo
          guardarTodoEnBD();
          return;
      }
      const item = itemsPendientes[index];
      setItemProcesando(item);
      setIndiceProcesando(index);

      // Si hay conflicto, mostramos modal. Si no, directo al cartel intermedio.
      if (item.estadoOriginal === "RESERVADA") {
          setModal("CONFLICTO");
      } else {
          setModal("INTERMEDIO"); // Punto 4: Cartel "Presione una tecla"
      }
  };

  // --- HANDLERS ---
  const handleOcuparIgual = () => setModal("INTERMEDIO"); // De conflicto a cartel
  
  const handleContinuarCarga = () => setModal("CARGA"); // De cartel a Huéspedes

  const handleAceptarCarga = (titular: any, acompanantes: any[]) => {
      // Guardamos los datos EN MEMORIA
      const datoFinal = {
          idHabitacion: itemProcesando.idHab,
          idHuespedTitular: titular.id,
          idsAcompañantes: acompanantes.map(a => a.id),
          cantidadDias: itemProcesando.dias,
          idReserva: null 
      };
      setDatosFinales([...datosFinales, datoFinal]);
      setModal("OPCIONES"); // Punto 9
  };

  const handleSeguirCargando = () => setModal("CARGA"); // Volver a editar
  
  const handleCargarOtra = () => {
      // Pasa al siguiente item pendiente
      procesarItem(indiceProcesando + 1);
  };

  const handleSalir = () => {
      // Punto 9: "Si aprieta salir sistema actualiza informacion"
      guardarTodoEnBD();
  };

  // --- GUARDADO REAL (PUNTO 4 Y 5 ARREGLADOS) ---
  const guardarTodoEnBD = async () => {
      try {
          // Recién AHORA llamamos al backend
          for (const datos of datosFinales) {
              await crearEstadia(datos);
          }
          setModal("EXITO");
          setItemsPendientes([]); // Limpiar visual
          setDatosFinales([]);
          handleBuscar(); // Refrescar estados reales
      } catch(e:any) { alert("Error al guardar: " + e.message); }
  };

  // Render Helper para pintar ROJO lo pendiente
  const getGrillaCarrito = () => {
      return itemsPendientes.map(i => ({
          idHab: i.idHab, inicio: i.inicio, fin: i.fin, 
          colorForzado: "bg-red-600 text-white opacity-90" // Rojo (Simulando ocupada)
      }));
  };
  
  // ... getDias igual ...
  const getDias = () => { 
      const d = []; const diff = Math.ceil((new Date(fechaHasta).getTime()-new Date(fechaDesde).getTime())/86400000);
      for(let i=0; i<=diff; i++){
          const dt = new Date(new Date(fechaDesde).getTime() + i*86400000);
          d.push({label:`${dt.getDate()}/${dt.getMonth()+1}`, iso:dt.toISOString().split('T')[0], index:i});
      }
      return d;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
       {/* ... Header y Filtros igual ... */}
       <div className="absolute top-6 left-6"><Link href="/" className="text-gray-500 font-bold">⬅ Volver</Link></div>
       <h1 className="text-4xl text-center text-[#d32f2f] font-bold mb-8 font-serif drop-shadow-sm tracking-widest">OCUPAR HABITACIÓN (CU15)</h1>
       <div className="bg-white px-10 py-6 rounded-xl shadow border flex items-end gap-8 mb-8">
          <div className="flex flex-col"><label className="font-bold text-sm">DESDE</label><input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="border-2 p-2 rounded"/></div>
          <div className="flex flex-col"><label className="font-bold text-sm">HASTA</label><input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="border-2 p-2 rounded"/></div>
          <button onClick={handleBuscar} className="bg-red-800 text-white px-8 py-2.5 rounded font-bold shadow">BUSCAR</button>
       </div>

       {busquedaRealizada && (
          <div className="w-full max-w-[95%] bg-white shadow-xl border rounded mb-10 relative">
             {/* Pasamos seleccionInicio para el azul y carrito para el rojo */}
             <Grilla 
                habitaciones={habitaciones} 
                estados={estados} 
                dias={getDias()} 
                onCellClick={handleCellClick} 
                seleccionInicio={clickInicio} 
                carrito={getGrillaCarrito()} 
             />
             
             {/* Botón para arrancar el flujo (Si hay pendientes y no estamos en modal) */}
             {itemsPendientes.length > 0 && modal === "NONE" && (
                <div className="fixed bottom-10 right-10 animate-bounce z-50">
                   <button onClick={iniciarProceso} className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-green-400 hover:bg-green-700">
                      INICIAR CHECK-IN ({itemsPendientes.length}) ➡
                   </button>
                </div>
             )}
          </div>
       )}

       {/* Modales */}
       <ModalConflicto isOpen={modal==="CONFLICTO"} onClose={()=>{/*Cancelar item*/}} onOcuparIgual={handleOcuparIgual} habitacionId={itemProcesando?.idHab} habitacionNumero={itemProcesando?.numero} fechaConsulta={itemProcesando?.fechaConflicto} />
       
       <ModalIntermedio isOpen={modal==="INTERMEDIO"} onContinue={handleContinuarCarga} />
       
       <ModalCargaHuespedes isOpen={modal==="CARGA"} habitacionNumero={itemProcesando?.numero} onAceptar={handleAceptarCarga} />
       
       <ModalOpciones isOpen={modal==="OPCIONES"} onSeguirCargando={handleSeguirCargando} onCargarOtra={handleCargarOtra} onSalir={handleSalir} />
       
       {modal === "EXITO" && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
             <div className="bg-white p-10 rounded shadow-2xl text-center border-b-8 border-green-500">
                 <h2 className="text-2xl font-bold">¡Check-in Exitoso!</h2>
                 <button onClick={()=>setModal("NONE")} className="bg-blue-600 text-white px-8 py-2 mt-4 rounded font-bold">CONTINUAR</button>
             </div>
         </div>
       )}
    </div>
  );
}