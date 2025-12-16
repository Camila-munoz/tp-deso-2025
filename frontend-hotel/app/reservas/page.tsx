"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getHabitaciones, getEstadoHabitaciones, crearReserva } from "@/services/api"
import Grilla from "@/components/habitaciones/Grilla"
import Link from "next/link"
// Iconos modernos
import { ArrowLeft, Calendar, Search, Loader2, AlertTriangle, CheckCircle, X, Info } from "lucide-react"

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
    // --- NUEVA VALIDACIÓN: BLOQUEAR CLICK EN EL PASADO ---
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCelda = new Date(fechaIso + "T00:00:00");

    if (fechaCelda < hoy) {
      setMensajeError("No se pueden realizar reservas en fechas pasadas.");
      setModalErrorOpen(true);
      return;
    }
    
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
    // --- 1. Validar Campos Vacíos (Lógica actual) ---
    const errors = {
      apellido: !form.apellido.trim(),
      nombre: !form.nombre.trim(),
      telefono: !form.telefono.trim(),
    }

    setFieldErrors(errors)

    // Foco en el primer error encontrado
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

    // --- 2. Validaciones de Formato (NUEVO) ---
    const soloTextoRegex = /^[a-zA-Z\s\u00C0-\u00FF']+$/; // Letras, espacios y acentos
    const telefonoRegex = /^\+?[\d\s\-]+$/; // Permite + opcionalmente, luego números, espacios o guiones.
    const telefonoSoloNumerosRegex = /[0-9]/; // Requiere que haya al menos un dígito [0-9]

    if (!soloTextoRegex.test(form.apellido)) {
        setMensajeError("El Apellido debe contener solo letras.");
        setModalErrorOpen(true);
        return;
    }

    if (!soloTextoRegex.test(form.nombre)) {
        setMensajeError("El Nombre debe contener solo letras.");
        setModalErrorOpen(true);
        return;
    }

    // 1. Validar el formato general (números, espacios, guiones, y opcionalmente +)
    if (!telefonoRegex.test(form.telefono)) {
        setMensajeError("El Teléfono contiene caracteres inválidos. Solo se permiten números, espacios, guiones y el signo '+' al inicio."); 
        setModalErrorOpen(true);
        return;
    }

    if (!telefonoSoloNumerosRegex.test(form.telefono)) {
        setMensajeError("El Teléfono debe contener al menos un número.");
        setModalErrorOpen(true);
        return;
    }

    if (form.nombre.length < 2 || form.nombre.length > 50) {
        setMensajeError("El Nombre debe tener entre 2 y 50 caracteres.");
        setModalErrorOpen(true);
        return;
    }
    if (form.apellido.length < 2 || form.apellido.length > 50) {
        setMensajeError("El Apellido debe tener entre 2 y 50 caracteres.");
        setModalErrorOpen(true);
        return;
    }

    const telefonoSoloDigitos = form.telefono.replace(/[\s\-\+]/g, ''); // Quitamos espacios, guiones y + para contar dígitos

    if (telefonoSoloDigitos.length < 7 || telefonoSoloDigitos.length > 15) { // Contamos solo los dígitos
        setMensajeError(`El Teléfono debe tener entre 7 y 15 dígitos (se detectaron ${telefonoSoloDigitos.length}).`);
        setModalErrorOpen(true);
        return;
    }

    // --- 3. Envío al Backend ---
    try {
      const detalles = carrito.map((item) => ({
        idHabitacion: item.idHab,
        fechaEntrada: item.inicio,
        fechaSalida: item.fin, 
      }))

      await crearReserva({
        detalles: detalles,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
      })

      setPaso("EXITO")
      // Opcional: Si quieres refrescar la grilla tras el éxito
      // handleBuscar() 
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900 relative">
      
      <div className="max-w-[95%] mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Crear Reserva</h1>
            <p className="text-gray-500 text-sm mt-1">Seleccione un rango de fechas para verificar disponibilidad.</p>
        </div>

        {/* FILTROS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-6 items-end mb-8">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Desde</label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                  <input 
                    type="date" 
                    value={fechaDesde} 
                    onChange={(e) => setFechaDesde(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-800" 
                  />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Hasta</label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                  <input 
                    type="date" 
                    value={fechaHasta} 
                    onChange={(e) => setFechaHasta(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-800" 
                  />
              </div>
            </div>
            <button 
                onClick={handleBuscar} 
                disabled={cargando} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex items-center gap-2 h-[46px]"
            >
              {cargando ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
              {cargando ? "BUSCANDO..." : "CONSULTAR"}
            </button>
        </div>

        {/* GRILLA */}
        {busquedaRealizada && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-1 relative overflow-hidden mb-8">
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

        {/* REFERENCIAS */}
        {busquedaRealizada && (
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600 mb-12 bg-gray-50 p-4 rounded-xl border border-gray-200">
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-400 rounded"></div> <span>Ocupado</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-100 border border-emerald-200 rounded"></div> <span>Disponible</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-300 rounded"></div> <span>Reservado</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-600 rounded"></div> <span>Tu Selección</span>
             </div>
          </div>
        )}

        {/* BOTÓN RESERVAR PRINCIPAL (Flotante) */}
        {carrito.length > 0 && (
          <div className="fixed bottom-10 right-10 z-40 animate-in slide-in-from-bottom-4 fade-in">
            <button
              onClick={() => setPaso("RESUMEN")}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 transform hover:scale-105"
            >
              <CheckCircle size={24}/>
              CONFIRMAR RESERVA ({carrito.length})
            </button>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2025 Hotel Premier - Sistema de Gestión</p>
          <p className="text-xs mt-1 opacity-70">Diseño de Sistemas - TP Final</p>
        </footer>
      </div>

      {/* --- MODALES --- */}

      {/* MODAL DE ERROR */}
      {modalErrorOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-[450px] overflow-hidden border border-gray-100">
            <div className="bg-rose-50 p-6 flex flex-col items-center justify-center border-b border-rose-100">
               <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <X size={32} />
               </div>
               <h3 className="text-xl font-bold text-rose-700">Error</h3>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-600 font-medium mb-8 leading-relaxed">{mensajeError}</p>
              <button
                onClick={() => setModalErrorOpen(false)}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESUMEN */}
      {paso === "RESUMEN" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-white w-[800px] rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                  <h2 className="text-2xl font-bold text-gray-900">Resumen de Reserva</h2>
                  <p className="text-gray-500 text-sm">Verifique los datos antes de continuar</p>
              </div>
              <button onClick={() => setPaso("NONE")} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-center text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="p-4">Tipo</th>
                        <th className="p-4">Ingreso</th>
                        <th className="p-4">Egreso</th>
                        <th className="p-4">Días</th>
                        <th className="p-4">Habitación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {carrito.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{item.tipo}</td>
                          <td className="p-4 text-gray-600">{item.inicio} <span className="text-xs text-gray-400 ml-1">12:00</span></td>
                          <td className="p-4 text-gray-600">{getNextDayISO(item.fin)} <span className="text-xs text-gray-400 ml-1">10:00</span></td>
                          <td className="p-4 font-bold text-indigo-600">{item.dias}</td>
                          <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs">#{item.numero}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0">
              <button
                onClick={handleRechazar}
                className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar Todo
              </button>
              <button
                onClick={() => setPaso("DATOS")}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2"
              >
                Continuar <ArrowLeft className="rotate-180" size={18}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DATOS */}
      {paso === "DATOS" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-[500px] p-8 rounded-3xl shadow-2xl relative">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={32}/>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Datos del Titular</h2>
                <p className="text-gray-500 text-sm">Ingrese la información de contacto para la reserva.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Apellido</label>
                <input
                  ref={apellidoRef}
                  placeholder="APELLIDO"
                  className={`w-full border p-3 rounded-xl outline-none transition-all uppercase font-medium bg-gray-50 focus:bg-white ${
                    fieldErrors.apellido ? "border-rose-300 ring-2 ring-rose-100" : "border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                  }`}
                  value={form.apellido}
                  onChange={(e) => {
                    setForm({ ...form, apellido: e.target.value.toUpperCase() })
                    setFieldErrors({ ...fieldErrors, apellido: false })
                  }}
                />
                {fieldErrors.apellido && <p className="text-rose-500 text-xs mt-1 font-bold ml-1 flex items-center gap-1"><AlertTriangle size={10}/> Campo Obligatorio</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Nombre</label>
                <input
                  ref={nombreRef}
                  placeholder="NOMBRE"
                  className={`w-full border p-3 rounded-xl outline-none transition-all uppercase font-medium bg-gray-50 focus:bg-white ${
                    fieldErrors.nombre ? "border-rose-300 ring-2 ring-rose-100" : "border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                  }`}
                  value={form.nombre}
                  onChange={(e) => {
                    setForm({ ...form, nombre: e.target.value.toUpperCase() })
                    setFieldErrors({ ...fieldErrors, nombre: false })
                  }}
                />
                {fieldErrors.nombre && <p className="text-rose-500 text-xs mt-1 font-bold ml-1 flex items-center gap-1"><AlertTriangle size={10}/> Campo Obligatorio</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Teléfono</label>
                <input
                  ref={telefonoRef}
                  placeholder="TELÉFONO"
                  className={`w-full border p-3 rounded-xl outline-none transition-all font-medium bg-gray-50 focus:bg-white ${
                    fieldErrors.telefono ? "border-rose-300 ring-2 ring-rose-100" : "border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                  }`}
                  value={form.telefono}
                  onChange={(e) => {
                    setForm({ ...form, telefono: e.target.value })
                    setFieldErrors({ ...fieldErrors, telefono: false })
                  }}
                />
                {fieldErrors.telefono && <p className="text-rose-500 text-xs mt-1 font-bold ml-1 flex items-center gap-1"><AlertTriangle size={10}/> Campo Obligatorio</p>}
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setPaso("RESUMEN")}
                className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
              >
                Confirmar <CheckCircle size={18}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO */}
      {paso === "EXITO" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in duration-300">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-[450px] text-center relative border border-gray-100">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
               <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Reserva Exitosa!</h2>
            <p className="text-gray-500 mb-8 font-medium">La reserva ha sido registrada correctamente en el sistema.</p>
            <button
              onClick={() => {
                setPaso("NONE")
                setCarrito([])
              }}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              Finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}