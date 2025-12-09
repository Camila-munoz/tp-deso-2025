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

export default function OcuparPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
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

  // --- LÓGICA PRINCIPAL CORREGIDA ---
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
  // ----------------------------------

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
        mostrarMensaje("Éxito", "Estadía(s) registrada(s).", "EXITO");
        setDatosFinales([]); setItemsPendientes([]); setClickInicio(null); setItemActual(null);
        setModal("NONE"); setModoBloqueoVisual(false); handleBuscar();
    }
  };

  const handleSalir = async () => {
    if (await guardarEnBDD(datosFinales)) {
        alert("¡Registro exitoso! Volviendo...");
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
        colorForzado: modoBloqueoVisual
          ? estaListo ? "bg-green-600 text-white opacity-90" : "bg-blue-600 text-white animate-pulse"
          : i.estadoOriginal === "RESERVADA" ? "bg-yellow-500 text-gray-900" : "bg-blue-600 text-white",
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
        d.idsAcompañantes.forEach((id: number) => acompanantes.add(id));
    });

    return { titulares, acompanantes };
  }

  const pendientesCount = itemsPendientes.length - datosFinales.length;
  const restricciones = getRestricciones();

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
      <div className="absolute top-6 left-6">
        <Link href="/principal" className="text-gray-500 font-bold hover:text-gray-700">⬅ Volver</Link>
      </div>
      <h1 className="text-4xl text-center text-[#d32f2f] font-bold mb-8 font-serif drop-shadow-sm tracking-widest border-b-2 border-red-200 pb-4 px-10 mt-2">
        OCUPAR HABITACIÓN
      </h1>

      <div className="bg-white px-10 py-6 rounded-xl shadow border flex items-end gap-8 mb-8">
        <div className="flex flex-col">
          <label className="font-bold text-sm">DESDE</label>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="border-2 p-2 rounded outline-none" />
        </div>
        <div className="flex flex-col">
          <label className="font-bold text-sm">HASTA</label>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="border-2 p-2 rounded outline-none" />
        </div>
        <button onClick={handleBuscar} disabled={cargando} className="bg-red-800 text-white px-8 py-2.5 rounded font-bold shadow hover:bg-red-900 transition disabled:opacity-50">
          {cargando ? "BUSCANDO..." : "BUSCAR DISPONIBILIDAD"}
        </button>
      </div>

      {busquedaRealizada && (
        <div className="w-full max-w-[95%] bg-white shadow-xl border rounded mb-10 relative">
          <Grilla
            habitaciones={habitaciones} estados={estados} dias={getDias()}
            onCellClick={handleCellClick} seleccionInicio={clickInicio} carrito={getGrillaCarrito()}
          />
          {itemsPendientes.length > 0 && modal === "NONE" && (
            <div className="fixed bottom-10 right-10 animate-in slide-in-from-bottom-10 z-40">
              <button onClick={iniciarProceso} className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-green-400 hover:bg-green-700 hover:scale-105 transition transform">
                {datosFinales.length > 0 && pendientesCount > 0 
                    ? `CONTINUAR SIGUIENTE (${pendientesCount}) ➡` 
                    : pendientesCount === 0 ? "FINALIZAR TODO" : `INICIAR CHECK-IN (${itemsPendientes.length}) ➡`}
              </button>
            </div>
          )}
        </div>
      )}

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
      
      <ModalOpciones isOpen={modal === "OPCIONES"} pendientes={pendientesCount} onSeguirCargando={handleSeguirCargando} onSiguienteHabitacion={handleSiguienteHabitacion} onGuardarYReiniciar={handleGuardarYReiniciar} onSalir={handleSalir} />
      <ModalMensaje isOpen={!!mensajeData} titulo={mensajeData?.titulo || ""} mensaje={mensajeData?.texto || ""} tipo={mensajeData?.tipo || "INFO"} onClose={() => setMensajeData(null)} />
    </div>
  );
}