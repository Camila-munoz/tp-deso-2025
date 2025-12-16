"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones, crearEstadiasMasivas } from "@/services/api";
import { useRouter } from "next/navigation";
import Grilla from "@/components/habitaciones/Grilla";
import ModalConflicto from "@/components/habitaciones/ModalConflicto";
import ModalIntermedio from "@/components/habitaciones/ModalIntermedio";
import ModalCargaHuespedes from "@/components/habitaciones/ModalCargaHuespedes";
import ModalOpciones from "@/components/habitaciones/ModalOpciones";
import ModalMensaje from "@/components/habitaciones/ModalMensaje";
import Link from "next/link";
// Iconos
import { ArrowLeft, Calendar, Search, Loader2, CheckCircle, Play, AlertTriangle } from "lucide-react";

export default function OcuparPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  
  // --- ESTADOS ---
  const [fechaDesde, setFechaDesde] = useState(today);
  const [fechaHasta, setFechaHasta] = useState(nextWeek);
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [clickInicio, setClickInicio] = useState<any>(null);
  const [itemsPendientes, setItemsPendientes] = useState<any[]>([]);
  const [datosFinales, setDatosFinales] = useState<any[]>([]);
  const [itemActual, setItemActual] = useState<any>(null);
  const [modal, setModal] = useState<"NONE" | "CONFLICTO" | "INTERMEDIO" | "CARGA" | "OPCIONES">("NONE");
  const [mensajeData, setMensajeData] = useState<{titulo: string, texto: string, tipo: "ERROR"|"INFO"|"EXITO" | null}>(null);
  const [modoBloqueoVisual, setModoBloqueoVisual] = useState(false);

  useEffect(() => {
    getHabitaciones().then((res) =>
      setHabitaciones(res.sort((a: any, b: any) => parseInt(a.numero) - parseInt(b.numero)))
    );
  }, []);

  const mostrarMensaje = (titulo: string, texto: string, tipo: "ERROR"|"INFO"|"EXITO" = "INFO") => {
    setMensajeData({ titulo, texto, tipo });
  };

  const verificarDisponibilidad = (mapaEstados: Record<string, string>): boolean => {
    const start = new Date(fechaDesde + "T00:00:00");
    const end = new Date(fechaHasta + "T00:00:00");
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    for (const habitacion of habitaciones) {
      for (let i = 0; i <= diff; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split("T")[0];
        const key = `${habitacion.id}_${iso}`;
        const estado = mapaEstados[key] || "LIBRE";
        if (estado === "LIBRE" || estado === "RESERVADA") return true;
      }
    }
    return false;
  };

  const handleBuscar = async () => {
    setCargando(true);
    try {
      const res = await getEstadoHabitaciones(fechaDesde, fechaHasta);
      if (res.success) {
        const mapa: any = {};
        res.data.forEach((i: any) => (mapa[`${i.idHabitacion}_${i.fecha}`] = i.estado));
        if (!verificarDisponibilidad(mapa)) {
          mostrarMensaje("Sin Disponibilidad", "No existen habitaciones disponibles.", "ERROR");
          return;
        }
        setEstados(mapa);
        setBusquedaRealizada(true);
        setClickInicio(null);
        setItemsPendientes([]);
        setDatosFinales([]);
        setModoBloqueoVisual(false);
      }
    } catch (e) {
      mostrarMensaje("Error", "Error conectando con el servidor.", "ERROR");
    } finally {
      setCargando(false);
    }
  };

  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    if (modoBloqueoVisual) return;
    const itemYaSeleccionado = itemsPendientes.find(
      (item) => item.idHab === hab.id && fechaIso >= item.inicio && fechaIso <= item.fin
    );
    if (itemYaSeleccionado) {
      const nuevosPendientes = itemsPendientes.filter((i) => i !== itemYaSeleccionado);
      setItemsPendientes(nuevosPendientes);
      setDatosFinales(datosFinales.filter((d) => d.idHabitacion !== itemYaSeleccionado.idHab));
      setClickInicio(null);
      return;
    }
    const key = `${hab.id}_${fechaIso}`;
    const estado = estados[key] || "LIBRE";
    if (estado === "OCUPADA" || estado === "FUERA_DE_SERVICIO") {
      mostrarMensaje("No Disponible", `La habitación ${hab.numero} está ${estado}.`, "ERROR");
      return;
    }
    if (!clickInicio) {
      setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso });
    } else {
      if (clickInicio.idHab !== hab.id) {
        setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso });
        return;
      }
      const d1 = new Date(clickInicio.fechaIso);
      const d2 = new Date(fechaIso);
      const inicio = d1 < d2 ? clickInicio.fechaIso : fechaIso;
      const fin = d1 < d2 ? fechaIso : clickInicio.fechaIso;
      const dias = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / 86400000) + 1;
      let fIter = new Date(inicio);
      const fEnd = new Date(fin);
      let esReservada = false;
      let fechaReserva = "";
      while (fIter <= fEnd) {
        const iso = fIter.toISOString().split("T")[0];
        const st = estados[`${hab.id}_${iso}`] || "LIBRE";
        if (st === "OCUPADA" || st === "FUERA_DE_SERVICIO") {
            setClickInicio(null);
            mostrarMensaje("Rango Inválido", "El rango incluye días no disponibles.", "ERROR");
            return;
        }
        if (st === "RESERVADA") {
          esReservada = true;
          fechaReserva = iso;
        }
        fIter.setDate(fIter.getDate() + 1);
      }
      const item = {
        idHab: hab.id,
        numero: hab.numero,
        inicio,
        fin,
        dias,
        estadoOriginal: esReservada ? "RESERVADA" : "LIBRE",
        fechaConflicto: fechaReserva,
      };
      setItemsPendientes([...itemsPendientes, item]);
      setClickInicio(null);
    }
  };

  const iniciarProceso = () => {
    if (itemsPendientes.length === 0) {
        mostrarMensaje("Atención", "Seleccione al menos una habitación.", "INFO");
        return;
    }
    if (itemsPendientes.length === datosFinales.length) {
        setModal("OPCIONES");
        return;
    }
    setModoBloqueoVisual(true);
    procesarSiguientePendiente();
  };

  const procesarSiguientePendiente = () => {
    const idsConfigurados = datosFinales.map((d) => d.idHabitacion);
    const siguienteItem = itemsPendientes.find((item) => !idsConfigurados.includes(item.idHab));
    if (!siguienteItem) return;
    evaluarItem(siguienteItem);
  };

  const evaluarItem = (item: any) => {
    setItemActual(item);
    if (item.estadoOriginal === "RESERVADA") setModal("CONFLICTO");
    else setModal("INTERMEDIO");
  };

  const handleOcuparIgual = () => setModal("CARGA");
  const handleContinuarCarga = () => setModal("CARGA");
  const handleVolver = () => {
    setItemsPendientes(itemsPendientes.filter((i) => i.idHab !== itemActual.idHab));
    setModal("NONE");
    if (itemsPendientes.length <= 1) setModoBloqueoVisual(false);
  };

  const handleAceptarCarga = (titular: any, acompanantes: any[]) => {
    const nuevoDato = {
      idHabitacion: itemActual.idHab,
      idHuespedTitular: titular.id,
      idHuespedesAcompanantes: acompanantes.map((a) => a.id),
      cantidadDias: itemActual.dias,
      cantidadHuespedes: 1 + acompanantes.length,
      idReserva: null, 
      _titularObj: titular,
      _acompObjs: acompanantes
    };
    const existeIdx = datosFinales.findIndex((d) => d.idHabitacion === itemActual.idHab);
    let nuevosDatos = [...datosFinales];
    if (existeIdx >= 0) nuevosDatos[existeIdx] = nuevoDato;
    else nuevosDatos.push(nuevoDato);
    setDatosFinales(nuevosDatos);
    setModal("OPCIONES");
  };

  const handleCancelarCarga = () => {
    if (confirm("¿Cancelar carga de esta habitación?")) handleVolver();
  };

  const handleSeguirCargando = () => setModal("CARGA");
  const handleSiguienteHabitacion = () => {
     setModal("NONE");
     procesarSiguientePendiente();
  };
  
  const guardarEnBDD = async (datos: any[]) => {
    try {
        await crearEstadiasMasivas(datos);
        return true;
    } catch (e: any) {
        mostrarMensaje("Error al Guardar", e.message || "Error inesperado.", "ERROR");
        return false;
    }
  };

  const handleGuardarYReiniciar = async () => {
    if (await guardarEnBDD(datosFinales)) {
        mostrarMensaje("Éxito", "Estadía(s) registrada(s) correctamente.", "EXITO");
        setDatosFinales([]); setItemsPendientes([]); setClickInicio(null); setItemActual(null);
        setModal("NONE"); setModoBloqueoVisual(false); 
        handleBuscar(); // IMPORTANTE: Refresca la grilla para ver el nuevo color Rojo
    }
  };

  const handleSalir = async () => {
    if (await guardarEnBDD(datosFinales)) {
        alert("¡Registro exitoso! Volviendo al menú...");
        router.push("/principal"); 
    }
  };

  const getDias = () => {
    if(!fechaDesde || !fechaHasta) return [];
    const d = [];
    const [yearDesde, monthDesde, dayDesde] = fechaDesde.split("-").map(Number);
    const [yearHasta, monthHasta, dayHasta] = fechaHasta.split("-").map(Number);
    const inicio = new Date(yearDesde, monthDesde - 1, dayDesde);
    const fin = new Date(yearHasta, monthHasta - 1, dayHasta);
    const current = new Date(inicio);
    while (current <= fin) {
      d.push({
        label: `${current.getDate()}/${current.getMonth() + 1}`,
        iso: current.toISOString().split("T")[0],
        index: d.length
      });
      current.setDate(current.getDate() + 1);
    }
    return d;
  };

  const getGrillaCarrito = () => {
    return itemsPendientes.map((i) => {
      const estaListo = datosFinales.some((d) => d.idHabitacion === i.idHab);
      return {
        idHab: i.idHab, inicio: i.inicio, fin: i.fin,
        // Usamos azul fuerte o el color original solicitado
        colorForzado: modoBloqueoVisual
          ? estaListo ? "bg-green-600 text-white opacity-90 shadow-md" : "bg-blue-600 text-white animate-pulse"
          : i.estadoOriginal === "RESERVADA" ? "bg-[#fef08a] text-black shadow-sm border border-yellow-400" : "bg-blue-600 text-white shadow-md",
      };
    });
  };

  const getDatosPrevios = () => {
    if (!itemActual) return null;
    const dato = datosFinales.find(d => d.idHabitacion === itemActual.idHab);
    if (!dato) return null;
    return { titular: dato._titularObj, acomp: dato._acompObjs };
  }

  const getRestricciones = () => {
    const titulares = new Set<number>();
    const acompanantes = new Set<number>();

    datosFinales.forEach(d => {
        if(d.idHabitacion === itemActual?.idHab) return;
        titulares.add(d.idHuespedTitular);
        d.idHuespedesAcompanantes.forEach((id: number) => acompanantes.add(id));
    });

    return { titulares, acompanantes };
  }

  const pendientesCount = itemsPendientes.length - datosFinales.length;
  const restricciones = getRestricciones();

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
      
      <div className="max-w-[95%] mx-auto w-full">
        
        {/* HEADER / BACK BUTTON */}
        <div className="w-full mb-8 flex items-center justify-between">
             <Link href="/principal" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <ArrowLeft size={20} />
                </div>
                <span>Volver al Menú</span>
             </Link>
        </div>

        {/* TÍTULO */}
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ocupar Habitación</h1>
            <p className="text-gray-500 text-sm mt-1">Gestione el ingreso de huéspedes (Check-In).</p>
        </div>

        {/* FILTROS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-6 items-end mb-8">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Desde</label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                  <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-800" />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Hasta</label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                  <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-800" />
              </div>
            </div>
            <button onClick={handleBuscar} disabled={cargando} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex items-center gap-2 h-[46px]">
              {cargando ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
              {cargando ? "BUSCANDO..." : "CONSULTAR"}
            </button>
        </div>

        {/* GRILLA */}
        {busquedaRealizada && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-1 relative overflow-hidden mb-4">
                <Grilla
                    habitaciones={habitaciones} estados={estados} dias={getDias()}
                    onCellClick={handleCellClick} seleccionInicio={clickInicio} carrito={getGrillaCarrito()}
                />
                
                {itemsPendientes.length > 0 && modal === "NONE" && (
                    <div className="fixed bottom-10 right-10 z-40 animate-in slide-in-from-bottom-10 fade-in">
                        <button onClick={iniciarProceso} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl text-lg flex items-center gap-3 transition-transform hover:scale-105">
                            {datosFinales.length > 0 && pendientesCount > 0 
                                ? <><AlertTriangle size={24}/> CONTINUAR SIGUIENTE ({pendientesCount})</>
                                : pendientesCount === 0 
                                    ? <><CheckCircle size={24}/> FINALIZAR TODO</>
                                    : <><Play size={24}/> INICIAR CHECK-IN ({itemsPendientes.length})</>
                            }
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* REFERENCIAS (LEYENDA CORREGIDA) */}
        {busquedaRealizada && (
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600 mb-12 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#f87171] rounded border border-red-300"></div> 
                <span>Ocupado</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#d9f99d] border border-green-300 rounded"></div> 
                <span>Disponible</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#fef08a] rounded border border-yellow-300"></div> 
                <span>Reservado</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded border border-blue-700"></div> 
                <span>Tu Selección</span>
             </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2025 Hotel Premier - Sistema de Gestión</p>
          <p className="text-xs mt-1 opacity-70">Diseño de Sistemas - TP Final</p>
        </footer>

        {/* MODALES */}
        <ModalConflicto isOpen={modal === "CONFLICTO"} onClose={handleVolver} onOcuparIgual={handleOcuparIgual} habitacionId={itemActual?.idHab} habitacionNumero={itemActual?.numero} fecha={itemActual?.fechaConflicto} />
        <ModalIntermedio isOpen={modal === "INTERMEDIO"} onContinue={handleContinuarCarga} />
        
        <ModalCargaHuespedes
            isOpen={modal === "CARGA"}
            habitacionNumero={itemActual?.numero}
            onAceptar={handleAceptarCarga}
            onCancelar={handleCancelarCarga}
            datosPrevios={getDatosPrevios()}
            idsTitularesOcupados={restricciones.titulares}
            idsAcompanantesOcupados={restricciones.acompanantes}
        />
        
        <ModalOpciones 
            isOpen={modal === "OPCIONES"} 
            pendientes={pendientesCount} 
            onSeguirCargando={handleSeguirCargando} 
            onSiguienteHabitacion={handleSiguienteHabitacion} 
            onGuardarYReiniciar={handleGuardarYReiniciar} 
            onSalir={handleSalir} 
            onClose={() => setModal("NONE")}
        />
        
        <ModalMensaje isOpen={!!mensajeData} titulo={mensajeData?.titulo || ""} mensaje={mensajeData?.texto || ""} tipo={mensajeData?.tipo || "INFO"} onClose={() => setMensajeData(null)} />
      </div>
    </div>
  );
}