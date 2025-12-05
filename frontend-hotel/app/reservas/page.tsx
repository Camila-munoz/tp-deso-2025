"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getHabitaciones, getEstadoHabitaciones, crearReserva } from "@/services/api"
import Grilla from "@/components/habitaciones/Grilla"
import Link from "next/link"

export default function ReservasPage() {
  const router = useRouter()

  // --- FECHA + 1 DÍA (Para Check-out y cálculos) ---
  const getNextDayISO = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    date.setDate(date.getDate() + 1)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // --- ESTADOS ---
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const toLocalISO = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const [fechaDesde, setFechaDesde] = useState(toLocalISO(today))
  const [fechaHasta, setFechaHasta] = useState(toLocalISO(nextWeek))

  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [estados, setEstados] = useState<Record<string, string>>({})
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  const [cargando, setCargando] = useState(false)

  const [clickInicio, setClickInicio] = useState<{ idHab: number; fechaIso: string; index: number } | null>(null)
  const [carrito, setCarrito] = useState<any[]>([])

  const [paso, setPaso] = useState<"NONE" | "RESUMEN" | "DATOS" | "EXITO">("NONE")

  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "" })
  const [fieldErrors, setFieldErrors] = useState({ nombre: false, apellido: false, telefono: false })

  const nombreRef = useRef<HTMLInputElement>(null)
  const apellidoRef = useRef<HTMLInputElement>(null)
  const telefonoRef = useRef<HTMLInputElement>(null)

  // ESTADO MODAL ERROR
  const [modalErrorOpen, setModalErrorOpen] = useState(false)
  const [mensajeError, setMensajeError] = useState("")

  // 1. Carga Inicial
  useEffect(() => {
    getHabitaciones()
      .then((res) => {
        setHabitaciones(res.sort((a: any, b: any) => Number.parseInt(a.numero) - Number.parseInt(b.numero)))
      })
      .catch(console.error)
  }, [])

  // 2. Buscar
  const handleBuscar = async () => {
    if (!fechaDesde || !fechaHasta) {
      setMensajeError("Debe ingresar un rango de fechas")
      setModalErrorOpen(true)
      return
    }

    if (fechaDesde > fechaHasta) {
      setMensajeError("La fecha 'Hasta' debe ser mayor o igual a la fecha 'Desde'.")
      setModalErrorOpen(true)
      return
    }

    setCargando(true)
    try {
      const res = await getEstadoHabitaciones(fechaDesde, fechaHasta)
      if (res.success) {
        const mapa: Record<string, string> = {}
        res.data.forEach((i: any) => (mapa[`${i.idHabitacion}_${i.fecha}`] = i.estado))
        setEstados(mapa)

        const hayDisponibilidad = verificarDisponibilidad(mapa)

        if (!hayDisponibilidad) {
          setMensajeError(
            "No existen habitaciones disponibles con las comodidades deseadas para el rango de fechas solicitado.",
          )
          setModalErrorOpen(true)
          setBusquedaRealizada(false)
          setClickInicio(null)
          setCarrito([])
          setCargando(false)
          return
        }

        setBusquedaRealizada(true)
        setClickInicio(null)
        setCarrito([])
      }
    } catch (e) {
      setMensajeError("Error de conexión.")
      setModalErrorOpen(true)
    } finally {
      setCargando(false)
    }
  }

  const verificarDisponibilidad = (mapaEstados: Record<string, string>): boolean => {
    // Generar todas las fechas del rango
    const start = new Date(fechaDesde + "T00:00:00")
    const end = new Date(fechaHasta + "T00:00:00")
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000)

    const fechasDelRango: string[] = []
    for (let i = 0; i <= diff; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      fechasDelRango.push(toLocalISO(d))
    }

    // Verificar si existe al menos una habitación libre en alguna fecha
    for (const habitacion of habitaciones) {
      for (const fecha of fechasDelRango) {
        const key = `${habitacion.id}_${fecha}`
        const estado = mapaEstados[key] || "LIBRE"

        // Si encontramos al menos una celda libre, hay disponibilidad
        if (estado === "LIBRE") {
          return true
        }
      }
    }

    // No se encontró ninguna habitación libre en ninguna fecha
    return false
  }

  // --- CLICK EN CELDA ---
  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    const key = `${hab.id}_${fechaIso}`
    const estado = estados[key] || "LIBRE"

    if (estado !== "LIBRE") {
      setClickInicio(null)
      setMensajeError("La habitación no está disponible en esa fecha.")
      setModalErrorOpen(true)
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

      const fechaIter = new Date(inicio + "T00:00:00")
      const fechaFinObj = new Date(fin + "T00:00:00")

      while (fechaIter <= fechaFinObj) {
        const isoIter = toLocalISO(fechaIter)
        const keyIter = `${hab.id}_${isoIter}`
        if ((estados[keyIter] || "LIBRE") !== "LIBRE") {
          setClickInicio(null)
          setMensajeError("El rango seleccionado incluye fechas no disponibles.")
          setModalErrorOpen(true)
          return
        }
        fechaIter.setDate(fechaIter.getDate() + 1)
      }

      const diasTotal = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / 86400000) + 1

      const yaExiste = carrito.some((item) => item.idHab === hab.id && item.inicio === inicio)
      if (!yaExiste) {
        setCarrito([
          ...carrito,
          {
            idHab: hab.id,
            numero: hab.numero,
            tipo: hab.tipo?.descripcion || "Estándar",
            inicio,
            fin,
            dias: diasTotal,
          },
        ])
      }
      setClickInicio(null)
    }
  }

  const handleSubmit = async () => {
  const errors = {
    apellido: !form.apellido.trim(),
    nombre: !form.nombre.trim(),
    telefono: !form.telefono.trim(),
  }

  setFieldErrors(errors)

  if (errors.apellido) {
    apellidoRef.current?.focus()
    return
  }
  if (errors.nombre) {
    nombreRef.current?.focus()
    return
  }
  if (errors.telefono) {
    telefonoRef.current?.focus()
    return
  }

  try {
    const detalles = carrito.map((item) => ({
      idHabitacion: item.idHab,
      fechaEntrada: item.inicio,
      fechaSalida: item.fin, // <- corregido: no sumar 1 día
    }))

    await crearReserva({
      detalles: detalles,
      nombre: form.nombre,
      apellido: form.apellido,
      telefono: form.telefono,
    })

    setPaso("EXITO")
    handleBuscar()
  } catch (e: any) {
    setMensajeError(e.message)
    setModalErrorOpen(true)
  }
}


  const getDias = () => {
    const start = new Date(fechaDesde + "T00:00:00")
    const end = new Date(fechaHasta + "T00:00:00")
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000)
    const dias = []
    for (let i = 0; i <= diff; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const iso = toLocalISO(d)
      const label = `${d.getDate()}/${d.getMonth() + 1}`
      dias.push({ label, iso, index: i })
    }
    return dias
  }

  // --- LÓGICA DE CANCELACIÓN EN MODAL ---
  const handleRechazar = () => {
    setPaso("NONE")
    setCarrito([]) // Limpia la selección en la grilla
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] p-6 font-sans relative flex flex-col items-center">
      {/* MENÚ */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-gray-600 hover:text-black font-bold flex items-center gap-1 text-sm">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">👤</div>
        </Link>
      </div>

      {/* CERRAR */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => router.push("/principal")}
          className="w-10 h-10 rounded-full bg-[#FF5252] border-2 border-black flex items-center justify-center text-white font-bold hover:bg-red-600"
        >
          X
        </button>
      </div>

      {/* TÍTULO */}
      <h1
        className="text-4xl text-center text-[#C2185B] font-black mb-10 font-serif tracking-widest mt-4"
        style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
      >
        RESERVAR HABITACIÓN
      </h1>

      {/* FILTROS */}
      <div className="flex items-center gap-10 mb-8 font-serif font-bold text-xl">
        <div className="flex items-center gap-2">
          <label>Desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="border-2 border-black p-1 rounded bg-white text-sm w-40 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="border-2 border-black p-1 rounded bg-white text-sm w-40 shadow-sm"
          />
        </div>
        <button
          onClick={handleBuscar}
          className="bg-blue-200 border-2 border-black px-4 py-1 text-sm shadow hover:bg-blue-300"
        >
          ACTUALIZAR
        </button>
      </div>

      {/* GRILLA */}
      {busquedaRealizada && (
        <div className="w-full max-w-[95%] bg-[#E0F7FA] border-2 border-black shadow-lg rounded-none overflow-hidden mb-6 p-1">
          <Grilla
            habitaciones={habitaciones}
            estados={estados}
            dias={getDias()}
            onCellClick={handleCellClick}
            seleccionInicio={clickInicio}
            carrito={carrito}
          />
        </div>
      )}

      {busquedaRealizada && (
        <div className="flex justify-center items-center gap-10 mb-8 bg-[#E0E0E0] py-4 w-full max-w-[95%] border-2 border-gray-400 rounded-b-xl shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF5252] border border-gray-600 shadow-sm"></div>
            <span className="font-bold text-black font-serif text-lg">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D4E157] border border-gray-600 shadow-sm"></div>
            <span className="font-bold text-black font-serif text-lg">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFF9C4] border border-gray-600 shadow-sm"></div>
            <span className="font-bold text-black font-serif text-lg">Reservado</span>
          </div>
        </div>
      )}

      {/* BOTÓN RESERVAR PRINCIPAL */}
      {carrito.length > 0 && (
        <button
          onClick={() => setPaso("RESUMEN")}
          className="bg-[#B3E5FC] text-black border-2 border-black px-16 py-2 font-bold font-serif text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all mb-10"
        >
          Reservar
        </button>
      )}

      {/* --- MODAL DE ERROR --- */}
      {modalErrorOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-gradient-to-b from-gray-200 to-gray-300 w-[450px] rounded-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="bg-[#B2EBF2] border-b-2 border-black p-2 flex justify-between items-center h-10">
              <span className="font-sans text-lg text-black ml-2">Error</span>
              <button
                onClick={() => setModalErrorOpen(false)}
                className="bg-[#FF5252] border border-black w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold hover:bg-red-600"
              >
                X
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 bg-[#FF3333] rounded-full border-2 border-black flex items-center justify-center shadow-md">
                <span className="text-white text-4xl font-sans font-bold">X</span>
              </div>
              <p className="text-center font-sans font-bold text-black text-sm px-4">{mensajeError}</p>
              <button
                onClick={() => setModalErrorOpen(false)}
                className="bg-gradient-to-b from-white to-gray-200 border-2 border-black px-10 py-1 font-black text-black shadow-md active:translate-y-1 hover:bg-gray-100 font-serif"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL RESUMEN --- */}
      {paso === "RESUMEN" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          {/* 1. Modal container: Max Height + Flex Col para estructurar */}
          <div className="bg-white p-0 shadow-2xl w-[800px] border-2 border-black max-h-[90vh] flex flex-col">
            {/* 2. Header: Shrink-0 para que no se achique */}
            <div className="bg-[#B2EBF2] p-4 border-b-2 border-black flex justify-center items-center relative shrink-0">
              <h2 className="text-xl font-black font-serif text-black uppercase">RESERVAR HABITACIÓN</h2>
              <button
                onClick={() => setPaso("NONE")}
                className="absolute right-4 w-8 h-8 rounded-full bg-[#FF5252] border-2 border-black flex items-center justify-center text-white font-bold hover:bg-red-600"
              >
                X
              </button>
            </div>

            <div className="p-0 overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-center text-sm border-collapse">
                <thead className="bg-[#B2EBF2] text-black font-bold uppercase border-b-2 border-black sticky top-0">
                  <tr>
                    <th className="p-3 border-r border-black">TIPO</th>
                    <th className="p-3 border-r border-black">INGRESO</th>
                    <th className="p-3 border-r border-black">EGRESO</th>
                    <th className="p-3 border-r border-black">CANTIDAD</th>
                    <th className="p-3">Nº HABITACION</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, idx) => (
                    <tr key={idx} className="border-b border-black h-16 font-bold">
                      <td className="p-3 border-r border-black">{item.tipo}</td>
                      <td className="p-3 border-r border-black">{item.inicio}, 12:00 hs</td>
                      <td className="p-3 border-r border-black">{getNextDayISO(item.fin)}, 10:00 hs</td>
                      <td className="p-3 border-r border-black">{item.dias}</td>
                      <td className="p-3">{item.numero}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 flex justify-around items-center bg-gray-100 border-t-2 border-black shrink-0">
              <button
                onClick={() => setPaso("DATOS")}
                className="bg-[#D4E157] border-2 border-black px-12 py-3 font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none uppercase"
              >
                ACEPTAR
              </button>
              <button
                onClick={handleRechazar}
                className="bg-[#FF5252] border-2 border-black px-12 py-3 font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none uppercase"
              >
                RECHAZAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DATOS --- */}
      {paso === "DATOS" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[600px] p-10 border border-gray-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative">
            <h2 className="text-3xl font-black font-serif text-black text-center mb-8">Reserva a nombre de:</h2>
            <div className="space-y-6 px-4">
              <div>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-right font-serif font-bold text-2xl">Apellido:</label>
                  <div className="flex-1">
                    <input
                      ref={apellidoRef}
                      placeholder="INGRESE EL APELLIDO"
                      className={`w-full border-2 p-2 rounded text-sm outline-none focus:border-black uppercase ${
                        fieldErrors.apellido ? "border-red-500" : "border-gray-400"
                      }`}
                      value={form.apellido}
                      onChange={(e) => {
                        setForm({ ...form, apellido: e.target.value.toUpperCase() })
                        setFieldErrors({ ...fieldErrors, apellido: false })
                      }}
                    />
                    {fieldErrors.apellido && <p className="text-red-500 text-xs mt-1">Campo Obligatorio</p>}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-right font-serif font-bold text-2xl">Nombre:</label>
                  <div className="flex-1">
                    <input
                      ref={nombreRef}
                      placeholder="Ingrese el nombre"
                      className={`w-full border-2 p-2 rounded text-sm outline-none focus:border-black uppercase ${
                        fieldErrors.nombre ? "border-red-500" : "border-gray-400"
                      }`}
                      value={form.nombre}
                      onChange={(e) => {
                        setForm({ ...form, nombre: e.target.value.toUpperCase() })
                        setFieldErrors({ ...fieldErrors, nombre: false })
                      }}
                    />
                    {fieldErrors.nombre && <p className="text-red-500 text-xs mt-1">Campo Obligatorio</p>}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-right font-serif font-bold text-2xl">Teléfono:</label>
                  <div className="flex-1">
                    <input
                      ref={telefonoRef}
                      placeholder="Ingrese el teléfono"
                      className={`w-full border-2 p-2 rounded text-sm outline-none focus:border-black ${
                        fieldErrors.telefono ? "border-red-500" : "border-gray-400"
                      }`}
                      value={form.telefono}
                      onChange={(e) => {
                        setForm({ ...form, telefono: e.target.value })
                        setFieldErrors({ ...fieldErrors, telefono: false })
                      }}
                    />
                    {fieldErrors.telefono && <p className="text-red-500 text-xs mt-1">Campo Obligatorio</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-12 px-8">
              <button
                onClick={handleSubmit}
                className="bg-[#D4E157] border-2 border-gray-600 text-black font-black px-10 py-3 shadow-md hover:bg-lime-300 uppercase font-serif tracking-wide"
              >
                RESERVAR
              </button>
              <button
                onClick={() => setPaso("RESUMEN")}
                className="bg-[#FF5252] border-2 border-gray-600 text-black font-black px-10 py-3 shadow-md hover:bg-red-400 uppercase font-serif tracking-wide"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {paso === "EXITO" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-10 border-4 border-green-500 rounded-xl shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">¡ÉXITO!</h2>
            <p className="font-bold mb-6">La reserva se ha registrado correctamente.</p>
            <button
              onClick={() => {
                setPaso("NONE")
                setCarrito([])
              }}
              className="bg-green-500 text-white border-2 border-black px-8 py-2 font-bold shadow hover:bg-green-600"
            >
              ACEPTAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
