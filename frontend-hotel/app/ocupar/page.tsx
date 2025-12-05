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
  // --- ESTADOS DE FECHA ---
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [fechaDesde, setFechaDesde] = useState(today);
  const [fechaHasta, setFechaHasta] = useState(nextWeek);
  
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);

  // --- CARRITO (Selección Visual) ---
  const [clickInicio, setClickInicio] = useState<any>(null);
  const [itemsPendientes, setItemsPendientes] = useState<any[]>([]); 
  
  // --- DATOS CONFIRMADOS (Memoria) ---
  // Aquí guardamos las habitaciones que YA tienen huéspedes asignados
  const [datosFinales, setDatosFinales] = useState<any[]>([]); 

  // --- PROCESO ACTUAL ---
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
    } catch(e) { alert("Error conectando."); } finally { setCargando(false); }
  };

  // --- 1. SELECCIÓN DE RANGOS ---
  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    if (modoBloqueoVisual) return; 

    // A. DESELECCIONAR
    const itemYaSeleccionado = itemsPendientes.find(item => 
        item.idHab === hab.id && fechaIso >= item.inicio && fechaIso <= item.fin
    );
    if (itemYaSeleccionado) {
        // Quitamos del carrito visual
        const nuevosPendientes = itemsPendientes.filter(i => i !== itemYaSeleccionado);
        setItemsPendientes(nuevosPendientes);
        // TAMBIÉN quitamos de datosFinales si ya estaba configurada
        setDatosFinales(datosFinales.filter(d => d.idHabitacion !== itemYaSeleccionado.idHab));
        setClickInicio(null);
        return; 
    }

    // B. SELECCIONAR
    const key = `${hab.id}_${fechaIso}`;
    const estado = estados[key] || "LIBRE";
    if(estado === "OCUPADA" || estado === "FUERA_DE_SERVICIO") return alert("Habitación ocupada.");

    if (!clickInicio) {
        setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso });
    } else {
        if (clickInicio.idHab !== hab.id) { setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso }); return; }
        
        const d1 = new Date(clickInicio.fechaIso); const d2 = new Date(fechaIso);
        const inicio = d1<d2 ? clickInicio.fechaIso : fechaIso;
        const fin = d1<d2 ? fechaIso : clickInicio.fechaIso;
        const dias = Math.ceil(Math.abs(d2.getTime()-d1.getTime())/86400000)+1;

        let fIter = new Date(inicio);
        const fEnd = new Date(fin);
        let esReservada = false; let fechaReserva = "";

        while(fIter <= fEnd) {
            const iso = fIter.toISOString().split('T')[0];
            const st = estados[`${hab.id}_${iso}`] || "LIBRE";
            if(st === "OCUPADA") { setClickInicio(null); return alert("Rango ocupado."); }
            if(st === "RESERVADA") { esReservada = true; fechaReserva = iso; }
            fIter.setDate(fIter.getDate()+1);
        }

        const item = { 
            idHab: hab.id, numero: hab.numero, inicio, fin, dias, 
            estadoOriginal: esReservada ? "RESERVADA" : "LIBRE", fechaConflicto: fechaReserva 
        };
        setItemsPendientes([...itemsPendientes, item]);
        setClickInicio(null);
    }
  };

  // --- 2. LÓGICA DE PROCESO ("Smart Queue") ---
  
  const iniciarProceso = () => {
      if (itemsPendientes.length === 0) return;
      setModoBloqueoVisual(true);
      procesarSiguientePendiente();
  };

  const procesarSiguientePendiente = () => {
      // Buscamos el primer item pendiente que NO esté en datosFinales (no configurado aún)
      const idsConfigurados = datosFinales.map(d => d.idHabitacion);
      const siguienteItem = itemsPendientes.find(item => !idsConfigurados.includes(item.idHab));

      if (!siguienteItem) {
          // Si todos están configurados, cerramos modal y esperamos al usuario (Guardar o Cargar Otra)
          setModal("NONE");
          return;
      }

      evaluarItem(siguienteItem);
  };

  const evaluarItem = (item: any) => {
      setItemActual(item);
      if (item.estadoOriginal === "RESERVADA") {
          setModal("CONFLICTO");
      } else {
          setModal("INTERMEDIO"); 
      }
  };

  // --- HANDLERS MODALES ---

  // Conflicto -> Ocupar Igual
  const handleOcuparIgual = () => setModal("INTERMEDIO");

  // Conflicto -> Volver (Cancelar este item específico)
  const handleVolver = () => {
      // Sacamos este item de pendientes
      setItemsPendientes(itemsPendientes.filter(i => i.idHab !== itemActual.idHab));
      setModal("NONE");
      // Si no quedan más items, desbloqueamos
      if (itemsPendientes.length <= 1) setModoBloqueoVisual(false);
  };

  // Intermedio -> Carga
  const handleContinuarCarga = () => setModal("CARGA");

  // Carga -> Aceptar -> Opciones (Guardar en memoria)
  const handleAceptarCarga = (titular: any, acompanantes: any[]) => {
      const nuevoDato = {
          idHabitacion: itemActual.idHab,
          idHuespedTitular: titular.id,
          idsAcompañantes: acompanantes.map(a => a.id),
          cantidadDias: itemActual.dias,
          idReserva: null
      };
      
      // Agregar o actualizar en la lista final
      const existeIdx = datosFinales.findIndex(d => d.idHabitacion === itemActual.idHab);
      if(existeIdx >= 0) {
          const copia = [...datosFinales];
          copia[existeIdx] = nuevoDato;
          setDatosFinales(copia);
      } else {
          setDatosFinales([...datosFinales, nuevoDato]);
      }

      setModal("OPCIONES");
  };

  const handleCancelarCarga = () => {
     if(confirm("¿Cancelar carga de esta habitación?")) handleVolver();
  };

  // Opciones -> Seguir Cargando (Re-editar el mismo)
  const handleSeguirCargando = () => setModal("CARGA");
  
  // Opciones -> Cargar Otra (Ir al siguiente pendiente)
  const handleCargarOtra = () => {
      // Simplemente llamamos al procesador, que buscará el siguiente NO configurado
      procesarSiguientePendiente();
  };

  // Opciones -> Salir (GUARDAR TODO EN BD)
  const handleSalir = async () => {
      try {
          // 1. Enviamos todo el paquete junto (Transacción Atómica)
          await crearEstadiasMasivas(datosFinales);
          
          // 2. Éxito
          setModal("EXITO");
          setDatosFinales([]); setItemsPendientes([]); setModoBloqueoVisual(false);
          handleBuscar();
      } catch(e:any) { 
          // Si falla, NO borramos los datos para que el usuario pueda corregir (ej: sacar acompañante duplicado)
          alert("Error al guardar:\n" + e.message); 
          setModal("NONE"); // Cerramos el modal para que vea qué pasó o intente de nuevo
      }
  };

  // Helpers
  const getDias = () => { 
      const d = []; const diff = Math.ceil((new Date(fechaHasta).getTime()-new Date(fechaDesde).getTime())/86400000);
      for(let i=0; i<=diff; i++){
          const dt = new Date(new Date(fechaDesde).getTime() + i*86400000);
          d.push({label:`${dt.getDate()}/${dt.getMonth()+1}`, iso:dt.toISOString().split('T')[0], index:i});
      }
      return d;
  };

  const getGrillaCarrito = () => {
      return itemsPendientes.map(i => {
          // Si ya está configurado en datosFinales, lo pintamos VERDE oscuro para indicar "Listo"
          const estaListo = datosFinales.some(d => d.idHabitacion === i.idHab);
          return {
              idHab: i.idHab, inicio: i.inicio, fin: i.fin, 
              colorForzado: modoBloqueoVisual 
                ? (estaListo ? "bg-green-600 text-white" : "bg-red-600 text-white opacity-90") 
                : "bg-blue-600 text-white"
          };
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
       <div className="absolute top-6 left-6"><Link href="/" className="text-gray-500 font-bold">⬅ Volver</Link></div>
       <h1 className="text-4xl text-center text-[#d32f2f] font-bold mb-8 font-serif drop-shadow-sm tracking-widest border-b-2 border-red-200 pb-4 px-10 mt-2">
        OCUPAR HABITACIÓN (CU15)
       </h1>

       <div className="bg-white px-10 py-6 rounded-xl shadow border flex items-end gap-8 mb-8">
          <div className="flex flex-col"><label className="font-bold text-sm">DESDE</label><input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="border-2 p-2 rounded"/></div>
          <div className="flex flex-col"><label className="font-bold text-sm">HASTA</label><input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="border-2 p-2 rounded"/></div>
          <button onClick={handleBuscar} className="bg-red-800 text-white px-8 py-2.5 rounded font-bold shadow">BUSCAR</button>
       </div>

       {busquedaRealizada && (
          <div className="w-full max-w-[95%] bg-white shadow-xl border rounded mb-10 relative">
             <Grilla 
                habitaciones={habitaciones} estados={estados} dias={getDias()} 
                onCellClick={handleCellClick} seleccionInicio={clickInicio} carrito={getGrillaCarrito()} 
             />
             
             {/* Botón INICIAR (Si hay pendientes sin configurar) */}
             {itemsPendientes.length > datosFinales.length && modal === "NONE" && (
                <div className="fixed bottom-10 right-10 animate-bounce z-50">
                   <button onClick={iniciarProceso} className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-green-400 hover:bg-green-700">
                      {datosFinales.length > 0 ? "CONTINUAR CARGA ➡" : `INICIAR CHECK-IN (${itemsPendientes.length}) ➡`}
                   </button>
                </div>
             )}

             {/* Botón FINALIZAR (Si todos están listos) */}
             {itemsPendientes.length > 0 && itemsPendientes.length === datosFinales.length && modal === "NONE" && (
                 <div className="fixed bottom-10 right-10 z-50">
                    <button onClick={handleSalir} className="bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-red-400 animate-pulse hover:scale-105 transition">
                        FINALIZAR Y GUARDAR TODO 💾
                    </button>
                 </div>
             )}
          </div>
       )}

       {/* Modales */}
       <ModalConflicto isOpen={modal==="CONFLICTO"} onClose={handleVolver} onOcuparIgual={handleOcuparIgual} habitacionId={itemActual?.idHab} habitacionNumero={itemActual?.numero} fecha={itemActual?.fechaConflicto} />
       <ModalIntermedio isOpen={modal==="INTERMEDIO"} onContinue={handleContinuarCarga} />
       <ModalCargaHuespedes isOpen={modal==="CARGA"} habitacionNumero={itemActual?.numero} onAceptar={handleAceptarCarga} onCancelar={handleCancelarCarga} />
       <ModalOpciones isOpen={modal==="OPCIONES"} onSeguirCargando={handleSeguirCargando} onCargarOtra={handleCargarOtra} onSalir={handleSalir} />
       
       {modal === "EXITO" && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-in fade-in">
             <div className="bg-white p-10 rounded-xl shadow-2xl text-center border-b-8 border-green-500 w-[500px]">
                 <h2 className="text-2xl font-bold">¡Check-in Exitoso!</h2>
                 <button onClick={()=>setModal("NONE")} className="bg-blue-600 text-white px-8 py-2 mt-4 rounded font-bold w-full">CONTINUAR</button>
             </div>
         </div>
       )}
    </div>
  );
}