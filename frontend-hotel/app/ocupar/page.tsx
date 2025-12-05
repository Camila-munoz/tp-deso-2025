"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { getHabitaciones, getEstadoHabitaciones, crearEstadiasMasivas } from "@/services/api"
import { useRouter } from "next/navigation"
import Grilla from "@/components/habitaciones/Grilla"
import ModalConflicto from "@/components/habitaciones/ModalConflicto"
import ModalIntermedio from "@/components/habitaciones/ModalIntermedio"
import ModalCargaHuespedes from "@/components/habitaciones/ModalCargaHuespedes"
import ModalOpciones from "@/components/habitaciones/ModalOpciones"
import Link from "next/link"

export default function OcuparPage() {
  const router = useRouter()

  const today = new Date().toISOString().split("T")[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  const [fechaDesde, setFechaDesde] = useState(today)
  const [fechaHasta, setFechaHasta] = useState(nextWeek)

  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [estados, setEstados] = useState<Record<string, string>>({})
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  const [cargando, setCargando] = useState(false)

  const [clickInicio, setClickInicio] = useState<any>(null)
  const [itemsPendientes, setItemsPendientes] = useState<any[]>([])
  const [datosFinales, setDatosFinales] = useState<any[]>([])

  const [itemActual, setItemActual] = useState<any>(null)
  const [modal, setModal] = useState<
    "NONE" | "CONFLICTO" | "INTERMEDIO" | "CARGA" | "OPCIONES" | "EXITO" | "SIN_DISPONIBILIDAD"
  >("NONE")
  const [mostrarModalOcupada, setMostrarModalOcupada] = useState(false)
  const [modoBloqueoVisual, setModoBloqueoVisual] = useState(false)
  const [fechaClickOcupada, setFechaClickOcupada] = useState<string>("")

  useEffect(() => {
    getHabitaciones().then((res) =>
      setHabitaciones(res.sort((a: any, b: any) => Number.parseInt(a.numero) - Number.parseInt(b.numero))),
    )
  }, [])

  const verificarDisponibilidad = (mapaEstados: Record<string, string>): boolean => {
    const start = new Date(fechaDesde + "T00:00:00")
    const end = new Date(fechaHasta + "T00:00:00")
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000)

    for (const habitacion of habitaciones) {
      for (let i = 0; i <= diff; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        const iso = d.toISOString().split("T")[0]
        const key = `${habitacion.id}_${iso}`
        const estado = mapaEstados[key] || "LIBRE"

        if (estado === "LIBRE" || estado === "RESERVADA") {
          return true
        }
      }
    }
    return false
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleBuscar()
    }
  }

  const handleButtonKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      callback()
    }
  }

  const handleBuscar = async () => {
    setCargando(true)
    try {
      const res = await getEstadoHabitaciones(fechaDesde, fechaHasta)
      if (res.success) {
        const mapa: any = {}
        res.data.forEach((i: any) => (mapa[`${i.idHabitacion}_${i.fecha}`] = i.estado))

        const hayDisponibilidad = verificarDisponibilidad(mapa)
        if (!hayDisponibilidad) {
          setModal("SIN_DISPONIBILIDAD")
          return
        }

        setEstados(mapa)
        setBusquedaRealizada(true)
        setClickInicio(null)
        setItemsPendientes([])
        setDatosFinales([])
        setModoBloqueoVisual(false)
      }
    } catch (e) {
      alert("Error conectando.")
    } finally {
      setCargando(false)
    }
  }

  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    if (modoBloqueoVisual) return

    const itemYaSeleccionado = itemsPendientes.find(
      (item) => item.idHab === hab.id && fechaIso >= item.inicio && fechaIso <= item.fin,
    )
    if (itemYaSeleccionado) {
      const nuevosPendientes = itemsPendientes.filter((i) => i !== itemYaSeleccionado)
      setItemsPendientes(nuevosPendientes)
      setDatosFinales(datosFinales.filter((d) => d.idHabitacion !== itemYaSeleccionado.idHab))
      setClickInicio(null)
      return
    }

    const key = `${hab.id}_${fechaIso}`
    const estado = estados[key] || "LIBRE"
    if (estado === "OCUPADA" || estado === "FUERA_DE_SERVICIO") {
      setItemActual({ idHab: hab.id, numero: hab.numero, estado })
      setFechaClickOcupada(fechaIso)
      setMostrarModalOcupada(true)
      return
    }

    if (!clickInicio) {
      setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso })
    } else {
      if (clickInicio.idHab !== hab.id) {
        setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso })
        return
      }

      const d1 = new Date(clickInicio.fechaIso)
      const d2 = new Date(fechaIso)
      const inicio = d1 < d2 ? clickInicio.fechaIso : fechaIso
      const fin = d1 < d2 ? fechaIso : clickInicio.fechaIso
      const dias = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / 86400000) + 1

      const fIter = new Date(inicio)
      const fEnd = new Date(fin)
      let esReservada = false
      let fechaReserva = ""

      while (fIter <= fEnd) {
        const iso = fIter.toISOString().split("T")[0]
        const st = estados[`${hab.id}_${iso}`] || "LIBRE"
        if (st === "OCUPADA") {
          setClickInicio(null)
          return alert("Rango ocupado.")
        }
        if (st === "RESERVADA") {
          esReservada = true
          fechaReserva = iso
        }
        fIter.setDate(fIter.getDate() + 1)
      }

      const item = {
        idHab: hab.id,
        numero: hab.numero,
        inicio,
        fin,
        dias,
        estadoOriginal: esReservada ? "RESERVADA" : "LIBRE",
        fechaConflicto: fechaReserva,
        actionType: esReservada ? "OCUPAR" : "OCUPAR",
      }
      setItemsPendientes([...itemsPendientes, item])
      setClickInicio(null)
    }
  }

  const iniciarProceso = () => {
    if (itemsPendientes.length === 0) return
    setModoBloqueoVisual(true)
    procesarSiguientePendiente()
  }

  const procesarSiguientePendiente = () => {
    const idsConfigurados = datosFinales.map((d) => d.idHabitacion)
    const siguienteItem = itemsPendientes.find((item) => !idsConfigurados.includes(item.idHab))

    if (!siguienteItem) {
      setModal("NONE")
      return
    }

    evaluarItem(siguienteItem)
  }

  const evaluarItem = (item: any) => {
    setItemActual(item)
    if (item.estadoOriginal === "RESERVADA") {
      setModal("CONFLICTO")
    } else {
      setModal("INTERMEDIO")
    }
  }

  const handleOcuparIgual = () => setModal("INTERMEDIO")

  const handleVolver = () => {
    setItemsPendientes(itemsPendientes.filter((i) => i.idHab !== itemActual.idHab))
    setModal("NONE")
    if (itemsPendientes.length <= 1) setModoBloqueoVisual(false)
  }

  const handleCerrarModalOcupada = () => {
    setItemActual(null)
    setMostrarModalOcupada(false)
    setFechaClickOcupada("")
  }

  const handleContinuarCarga = () => setModal("CARGA")

  const handleAceptarCarga = (titular: any, acompanantes: any[]) => {
    const nuevoDato = {
      idHabitacion: itemActual.idHab,
      idHuespedTitular: titular.id,
      idsAcompañantes: acompanantes.map((a) => a.id),
      cantidadDias: itemActual.dias,
      idReserva: null,
    }

    const existeIdx = datosFinales.findIndex((d) => d.idHabitacion === itemActual.idHab)
    if (existeIdx >= 0) {
      const copia = [...datosFinales]
      copia[existeIdx] = nuevoDato
      setDatosFinales(copia)
    } else {
      setDatosFinales([...datosFinales, nuevoDato])
    }

    setModal("OPCIONES")
  }

  const handleCancelarCarga = () => {
    if (confirm("¿Cancelar carga de esta habitación?")) handleVolver()
  }

  const handleSeguirCargando = () => setModal("CARGA")

  const handleCargarOtra = () => {
 
  setModal("NONE");          
  setItemActual(null);        
  setModoBloqueoVisual(false); 
};

  const handleSalir = async () => {
    try {
      await crearEstadiasMasivas(datosFinales)

      await handleBuscar()

      setModal("EXITO")
      setDatosFinales([])
      setItemsPendientes([])
      setModoBloqueoVisual(false)
    } catch (e: any) {
      alert("Error al guardar:\n" + e.message)
      setModal("NONE")
    }
  }

  const getDias = () => {
    const d = []
    const [yearDesde, monthDesde, dayDesde] = fechaDesde.split("-").map(Number)
    const [yearHasta, monthHasta, dayHasta] = fechaHasta.split("-").map(Number)

    const inicio = new Date(yearDesde, monthDesde - 1, dayDesde)
    const fin = new Date(yearHasta, monthHasta - 1, dayHasta)

    const current = new Date(inicio)
    while (current <= fin) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, "0")
      const day = String(current.getDate()).padStart(2, "0")

      d.push({
        label: `${current.getDate()}/${current.getMonth() + 1}`,
        iso: `${year}-${month}-${day}`,
        index: d.length,
      })
      current.setDate(current.getDate() + 1)
    }
    return d
  }

  const getGrillaCarrito = () => {
    return itemsPendientes.map((i) => {
      const estaListo = datosFinales.some((d) => d.idHabitacion === i.idHab)
      return {
        idHab: i.idHab,
        inicio: i.inicio,
        fin: i.fin,
        colorForzado: modoBloqueoVisual
          ? estaListo
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white opacity-90"
          : i.estadoOriginal === "RESERVADA"
            ? "bg-yellow-500 text-gray-900"
            : "bg-blue-600 text-white",
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
      <div className="absolute top-6 left-6">
        <Link href="/principal" className="text-gray-500 font-bold">
          ⬅ Volver
        </Link>
      </div>
      <h1 className="text-4xl text-center text-[#d32f2f] font-bold mb-8 font-serif drop-shadow-sm tracking-widest border-b-2 border-red-200 pb-4 px-10 mt-2">
        OCUPAR HABITACIÓN (CU15)
      </h1>

      <div className="bg-white px-10 py-6 rounded-xl shadow border flex items-end gap-8 mb-8">
        <div className="flex flex-col">
          <label className="font-bold text-sm">DESDE</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-2 p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-bold text-sm">HASTA</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-2 p-2 rounded"
          />
        </div>
        <button
          onClick={handleBuscar}
          onKeyDown={(e) => handleButtonKeyDown(e, handleBuscar)}
          disabled={cargando}
          className="bg-red-800 text-white px-8 py-2.5 rounded font-bold shadow disabled:opacity-50"
        >
          {cargando ? "BUSCANDO..." : "BUSCAR"}
        </button>
      </div>

      {busquedaRealizada && (
        <div className="w-full max-w-[95%] bg-white shadow-xl border rounded mb-10 relative">
          <Grilla
            habitaciones={habitaciones}
            estados={estados}
            dias={getDias()}
            onCellClick={handleCellClick}
            seleccionInicio={clickInicio}
            carrito={getGrillaCarrito()}
          />

          {itemsPendientes.length > datosFinales.length && modal === "NONE" && (
            <div className="fixed bottom-10 right-10 animate-bounce z-50">
              <button
                onClick={iniciarProceso}
                onKeyDown={(e) => handleButtonKeyDown(e, iniciarProceso)}
                className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-green-400 hover:bg-green-700"
              >
                {datosFinales.length > 0 ? "CONTINUAR CARGA ➡" : `INICIAR CHECK-IN (${itemsPendientes.length}) ➡`}
              </button>
            </div>
          )}

          {itemsPendientes.length > 0 && itemsPendientes.length === datosFinales.length && modal === "NONE" && (
            <div className="fixed bottom-10 right-10 z-50">
              <button
                onClick={handleSalir}
                onKeyDown={(e) => handleButtonKeyDown(e, handleSalir)}
                className="bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-red-400 animate-pulse hover:scale-105 transition"
              >
                FINALIZAR Y GUARDAR TODO 💾
              </button>
            </div>
          )}
        </div>
      )}

      <ModalConflicto
        isOpen={modal === "CONFLICTO"}
        onClose={handleVolver}
        onOcuparIgual={handleOcuparIgual}
        habitacionId={itemActual?.idHab}
        habitacionNumero={itemActual?.numero}
        fecha={itemActual?.fechaConflicto}
      />
      <ModalIntermedio isOpen={modal === "INTERMEDIO"} onContinue={handleContinuarCarga} />
      <ModalCargaHuespedes
        isOpen={modal === "CARGA"}
        habitacionNumero={itemActual?.numero}
        onAceptar={handleAceptarCarga}
        onCancelar={handleCancelarCarga}
      />
      <ModalOpciones
        isOpen={modal === "OPCIONES"}
        onSeguirCargando={handleSeguirCargando}
        onCargarOtra={handleCargarOtra}
        onSalir={handleSalir}
      />

      {mostrarModalOcupada && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-in fade-in">
          <div className="bg-white p-10 rounded-xl shadow-2xl text-center border-b-8 border-red-500 w-[500px]">
            <h2 className="text-2xl font-bold text-red-600">Habitación no disponible</h2>
            <p className="mt-4 text-gray-700 text-lg">
              La habitación <strong>{itemActual?.numero}</strong> está{" "}
              <strong>{itemActual?.estado === "OCUPADA" ? "ocupada" : "fuera de servicio"}</strong> en la fecha{" "}
              <strong>
                {new Date(fechaClickOcupada).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </strong>
              .
            </p>
            <p className="mt-2 text-gray-600 text-sm">Por favor, selecciona otra habitación o rango de fechas.</p>
            <button
              onClick={handleCerrarModalOcupada}
              onKeyDown={(e) => handleButtonKeyDown(e, handleCerrarModalOcupada)}
              className="bg-blue-600 text-white px-8 py-2 mt-6 rounded font-bold w-full hover:bg-blue-700"
            >
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {modal === "EXITO" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-in fade-in">
          <div className="bg-white p-10 rounded-xl shadow-2xl text-center border-b-8 border-green-500 w-[500px]">
            <h2 className="text-2xl font-bold">¡Check-in Exitoso!</h2>
            <button
              onClick={() => setModal("NONE")}
              onKeyDown={(e) => handleButtonKeyDown(e, () => setModal("NONE"))}
              className="bg-blue-600 text-white px-8 py-2 mt-4 rounded font-bold w-full"
            >
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {modal === "SIN_DISPONIBILIDAD" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-in fade-in">
          <div className="bg-white p-10 rounded-xl shadow-2xl text-center border-b-8 border-red-500 w-[500px]">
            <h2 className="text-2xl font-bold text-red-600">No hay disponibilidad</h2>
            <p className="mt-4 text-gray-700 text-lg">
              No existen habitaciones disponibles o reservadas con los requisitos solicitados para el rango de fechas{" "}
              <strong>{fechaDesde}</strong> a <strong>{fechaHasta}</strong>.
            </p>
            <p className="mt-3 text-gray-600 text-sm">Por favor, intenta con diferentes fechas o comodidades.</p>
            <button
              onClick={() => router.push("/principal")}
              onKeyDown={(e) => handleButtonKeyDown(e, () => router.push("/principal"))}
              className="bg-red-600 text-white px-8 py-2 mt-6 rounded font-bold w-full hover:bg-red-700"
            >
              VOLVER A PRINCIPAL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}