"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones, crearEstadiasMasivas } from "@/services/api";
import Grilla from "@/components/habitaciones/Grilla";
import ModalConflicto from "@/components/habitaciones/ModalConflicto";
import ModalIntermedio from "@/components/habitaciones/ModalIntermedio";
import ModalCargaHuespedes from "@/components/habitaciones/ModalCargaHuespedes";
import ModalOpciones from "@/components/habitaciones/ModalOpciones";
import Link from "next/link";

export default function OcuparPage() {
  // Estados de Fecha
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [fechaDesde, setFechaDesde] = useState(today);
  const [fechaHasta, setFechaHasta] = useState(nextWeek);
  
  // Datos
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);

  // --- CARRITO (Visual) ---
  const [clickInicio, setClickInicio] = useState<any>(null);
  const [itemsPendientes, setItemsPendientes] = useState<any[]>([]); 
  
  // --- DATOS PROCESADOS (Listos para guardar) ---
  const [datosFinales, setDatosFinales] = useState<any[]>([]); 

  // --- CONTROL DE FLUJO ---
  const [indiceProcesando, setIndiceProcesando] = useState(0);
  const [itemActual, setItemActual] = useState<any>(null);
  const [modal, setModal] = useState<"NONE" | "CONFLICTO" | "INTERMEDIO" | "CARGA" | "OPCIONES" | "EXITO">("NONE");
  const [modoBloqueoVisual, setModoBloqueoVisual] = useState(false);

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
            // Limpieza total
            setClickInicio(null); setItemsPendientes([]); setDatosFinales([]); setModoBloqueoVisual(false);
        }
    } catch(e) {} finally { setCargando(false); }
  };

  // 1. SELECCIÓN EN GRILLA
  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    if (modoBloqueoVisual) return; 

    // Deseleccionar
    const itemYaSeleccionado = itemsPendientes.find(item => item.idHab === hab.id && fechaIso >= item.inicio && fechaIso <= item.fin);
    if (itemYaSeleccionado) {
        setItemsPendientes(itemsPendientes.filter(i => i !== itemYaSeleccionado));
        setDatosFinales(datosFinales.filter(d => d.idHabitacion !== itemYaSeleccionado.idHab)); // Borrar también si ya estaba listo
        setClickInicio(null);
        return; 
    }

    const key = `${hab.id}_${fechaIso}`;
    if ((estados[key] || "LIBRE") === "OCUPADA") return alert("Habitación ocupada.");

    if (!clickInicio) {
        setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso });
    } else {
        if (clickInicio.idHab !== hab.id) { setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso }); return; }
        
        const d1 = new Date(clickInicio.fechaIso); const d2 = new Date(fechaIso);
        const inicio = d1<d2 ? clickInicio.fechaIso : fechaIso;
        const fin = d1<d2 ? fechaIso : clickInicio.fechaIso;
        const dias = Math.ceil(Math.abs(d2.getTime()-d1.getTime())/86400000)+1;

        // Validar ocupación
        let fIter = new Date(inicio);
        const fEnd = new Date(fin);
        let esReservada = false; let fechaReserva = "";

        while(fIter <= fEnd) {
            const iso = fIter.toISOString().split('T')[0];
            const st = estados[`${hab.id}_${iso}`] || "LIBRE";
            if(st === "OCUPADA") { setClickInicio(null); return alert("Rango ocupado."); }
            if(st === "RESERVADA" && !esReservada) { esReservada = true; fechaReserva = iso; }
            fIter.setDate(fIter.getDate()+1);
        }

        setItemsPendientes([...itemsPendientes, { 
            idHab: hab.id, numero: hab.numero, inicio, fin, dias, 
            estadoOriginal: esReservada ? "RESERVADA" : "LIBRE", fechaConflicto: fechaReserva 
        }]);
        setClickInicio(null);
    }
  };

  // 2. INICIAR PROCESO (Botón Flotante)
  const iniciarProceso = () => {
      if (itemsPendientes.length === 0) return;
      
      // Activa el ROJO visual
      setModoBloqueoVisual(true);
      
      // Buscar el primer item pendiente que NO esté ya procesado (útil para "Cargar Otra")
      const procesadosIds = new Set(datosFinales.map(d => d.idHabitacion));
      const primerPendienteIdx = itemsPendientes.findIndex(i => !procesadosIds.has(i.idHab));
      
      if (primerPendienteIdx !== -1) {
          setIndiceProcesando(primerPendienteIdx);
          evaluarItem(itemsPendientes[primerPendienteIdx]);
      } else {
          // Si todos están listos, no hacemos nada (el usuario debe dar Salir o elegir más)
          // Opcional: Alertar "Todos los items ya tienen huéspedes asignados"
      }
  };

  const evaluarItem = (item: any) => {
      setItemActual(item);
      if (item.estadoOriginal === "RESERVADA") setModal("CONFLICTO");
      else setModal("INTERMEDIO"); // Cartel "Presione una tecla"
  };

  // HANDLERS MODALES
  const handleOcuparIgual = () => setModal("INTERMEDIO");
  const handleVolver = () => { // Cancelar item actual
      const nuevos = itemsPendientes.filter((_, i) => i !== indiceProcesando);
      setItemsPendientes(nuevos);
      setModal("NONE");
      if (nuevos.length === 0) setModoBloqueoVisual(false);
  };

  const handleContinuarCarga = () => setModal("CARGA");

  const handleAceptarCarga = (titular: any, acompanantes: any[]) => {
      const nuevoDato = {
          idHabitacion: itemActual.idHab,
          idHuespedTitular: titular.id,
          idsAcompañantes: acompanantes.map(a => a.id),
          cantidadDias: itemActual.dias,
          idReserva: null
      };
      
      // Guardar/Actualizar en memoria
      const existeIdx = datosFinales.findIndex(d => d.idHabitacion === itemActual.idHab);
      if (existeIdx >= 0) {
          const copia = [...datosFinales]; copia[existeIdx] = nuevoDato; setDatosFinales(copia);
      } else {
          setDatosFinales([...datosFinales, nuevoDato]);
      }
      setModal("OPCIONES");
  };

  // --- OPCIONES ---
  const handleSeguirCargando = () => setModal("CARGA"); // Re-editar mismo item
  
  const handleCargarOtra = () => {
      // Intentar ir al siguiente item de la lista
      const next = indiceProcesando + 1;
      if (next < itemsPendientes.length) {
          setIndiceProcesando(next);
          evaluarItem(itemsPendientes[next]);
      } else {
          // Se acabaron los pendientes -> Volver a la grilla para elegir más
          setModal("NONE");
          setModoBloqueoVisual(false); // Desbloquear para permitir nuevos clics
      }
  };

  const handleSalir = async () => {
      try {
          // Guardado Masivo
          await crearEstadiasMasivas(datosFinales);
          setModal("EXITO");
          setDatosFinales([]); setItemsPendientes([]); setModoBloqueoVisual(false);
          handleBuscar();
      } catch(e:any) { alert("Error al guardar: " + e.message); }
  };

  // Render Helpers
  const getDias = () => { 
      const d = []; const diff = Math.ceil((new Date(fechaHasta).getTime()-new Date(fechaDesde).getTime())/86400000);
      for(let i=0; i<=diff; i++){
          const dt = new Date(new Date(fechaDesde).getTime() + i*86400000);
          d.push({label:`${dt.getDate()}/${dt.getMonth()+1}`, iso:dt.toISOString().split('T')[0], index:i});
      }
      return d;
  };

  const getGrillaCarrito = () => {
      const procesadosIds = new Set(datosFinales.map(d => d.idHabitacion));
      return itemsPendientes.map(i => ({
          idHab: i.idHab, inicio: i.inicio, fin: i.fin, 
          // ROJO si está bloqueado O si ya está listo (para que se vea ocupada visualmente)
          colorForzado: (modoBloqueoVisual || procesadosIds.has(i.idHab)) 
             ? "bg-red-600 text-white opacity-90" 
             : "bg-blue-600 text-white"
      }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
       <div className="absolute top-6 left-6"><Link href="/" className="text-gray-500 font-bold">⬅ Volver</Link></div>
       <h1 className="text-4xl text-center text-[#d32f2f] font-bold mb-8 font-serif drop-shadow-sm tracking-widest">OCUPAR HABITACIÓN (CU15)</h1>

       <div className="bg-white px-10 py-6 rounded-xl shadow border flex items-end gap-8 mb-8">
          <div className="flex flex-col"><label className="font-bold text-sm">DESDE</label><input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="border-2 p-2 rounded"/></div>
          <div className="flex flex-col"><label className="font-bold text-sm">HASTA</label><input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="border-2 p-2 rounded"/></div>
          <button onClick={handleBuscar} className="bg-red-800 text-white px-8 py-2.5 rounded font-bold shadow">BUSCAR</button>
       </div>

       {busquedaRealizada && (
          <div className="w-full max-w-[95%] bg-white shadow-xl border rounded mb-10 relative">
             <Grilla habitaciones={habitaciones} estados={estados} dias={getDias()} onCellClick={handleCellClick} seleccionInicio={clickInicio} carrito={getGrillaCarrito()} />
             
             {/* Botón INICIAR: Aparece si hay pendientes SIN procesar */}
             {itemsPendientes.length > datosFinales.length && modal === "NONE" && (
                <div className="fixed bottom-10 right-10 animate-bounce z-50">
                   <button onClick={iniciarProceso} className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-green-400 hover:bg-green-700">
                      INICIAR CHECK-IN ({itemsPendientes.length - datosFinales.length}) ➡
                   </button>
                </div>
             )}

             {/* Botón FINALIZAR: Aparece si hay ALGO procesado */}
             {datosFinales.length > 0 && modal === "NONE" && (
                 <div className="fixed bottom-10 right-10 z-50">
                    <button onClick={handleSalir} className="bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-red-400 hover:bg-red-700 animate-pulse">
                        FINALIZAR Y GUARDAR ({datosFinales.length}) 💾
                    </button>
                 </div>
             )}
          </div>
       )}

       {/* MODALES */}
       <ModalConflicto isOpen={modal==="CONFLICTO"} onClose={handleVolver} onOcuparIgual={handleOcuparIgual} habitacionId={itemActual?.idHab} habitacionNumero={itemActual?.numero} fecha={itemActual?.fechaConflicto} />
       <ModalIntermedio isOpen={modal==="INTERMEDIO"} onContinue={handleContinuarCarga} />
       
       <ModalCargaHuespedes 
          isOpen={modal==="CARGA"} 
          habitacionNumero={itemActual?.numero} 
          onAceptar={handleAceptarCarga} 
          // NUEVO: Botón Volver Atrás en el modal
          onBack={() => setModal("INTERMEDIO")} 
          onCancelar={handleVolver} 
       />
       
       <ModalOpciones isOpen={modal==="OPCIONES"} onSeguirCargando={handleSeguirCargando} onCargarOtra={handleCargarOtra} onSalir={handleSalir} />
       
       {modal === "EXITO" && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
             <div className="bg-white p-10 rounded shadow border-b-8 border-green-500"><h2 className="text-2xl font-bold">¡Éxito!</h2><button onClick={()=>setModal("NONE")} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">OK</button></div>
         </div>
       )}
    </div>
  );
}