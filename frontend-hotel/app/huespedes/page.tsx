"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { buscarHuespedes, crearHuesped, crearHuespedForzado } from "@/services/api"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

export default function HuespedesPage() {
  const router = useRouter()

  // --- ESTADOS ---
  const [filtros, setFiltros] = useState({ apellido: "", nombre: "", numDoc: "", tipoDoc: "" })
  const [resultados, setResultados] = useState<any[]>([])
  const [seleccionado, setSeleccionado] = useState<number | null>(null)

  // Estado para Ordenamiento
  const [orden, setOrden] = useState<{ columna: string; direccion: "asc" | "desc" } | null>(null)

  // Estado para mensajes y carga
  const [mensaje, setMensaje] = useState("")
  const [cargando, setCargando] = useState(false)
  const [mostrarModalNoResultados, setMostrarModalNoResultados] = useState(false)

  // Estados para Alta
  const [mostrarFormAlta, setMostrarFormAlta] = useState(false)
  const [nuevoHuesped, setNuevoHuesped] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    posicionIVA: "CONSUMIDOR_FINAL",
  })
  const [errorAlta, setErrorAlta] = useState<any>(null)

  // --- LÓGICA BUSCAR ---
  const handleBuscar = async () => {
    setCargando(true)
    setResultados([])
    setMensaje("")
    setSeleccionado(null)
    setMostrarModalNoResultados(false)
    setOrden(null) // Reseteamos orden al buscar nuevo

    try {
      const data = await buscarHuespedes(filtros)

      if (data.success) {
        setResultados(data.data)
      } else {
        // Si no hay éxito (404), activamos flujo alternativo 4.A
        setMensaje(data.message || "No se encontraron resultados.")
        setMostrarModalNoResultados(true)
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor.")
    } finally {
      setCargando(false)
    }
  }

  // --- LÓGICA DE ORDENAMIENTO ---
  const handleOrdenar = (columna: string) => {
    setOrden((prev) => {
      if (prev && prev.columna === columna) {
        // Si ya estaba ordenada por esta columna, invertimos dirección
        return { columna, direccion: prev.direccion === "asc" ? "desc" : "asc" }
      }
      // Si es nueva columna, orden ascendente por defecto
      return { columna, direccion: "asc" }
    })
  }

  // Usamos useMemo para ordenar sin mutar el array original cada render
  const resultadosOrdenados = useMemo(() => {
    if (!orden) return resultados

    return [...resultados].sort((a, b) => {
      const valorA = a[orden.columna]?.toString().toLowerCase() || ""
      const valorB = b[orden.columna]?.toString().toLowerCase() || ""

      if (valorA < valorB) return orden.direccion === "asc" ? -1 : 1
      if (valorA > valorB) return orden.direccion === "asc" ? 1 : -1
      return 0
    })
  }, [resultados, orden])

  // Renderiza el icono de ordenamiento en la cabecera
  const renderSortIcon = (columna: string) => {
    if (orden?.columna !== columna) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-50" />
    return orden.direccion === "asc" ? (
      <ArrowUp className="w-4 h-4 text-black" />
    ) : (
      <ArrowDown className="w-4 h-4 text-black" />
    )
  }

  // --- LÓGICA SIGUIENTE (MODIFICADA SEGÚN FLUJO CU02) ---
  const handleSiguiente = () => {
    if (seleccionado) {
      // CASO A: Hay un seleccionado -> Vamos a MODIFICAR (CU10)
      const huesped = resultados.find((h) => h.id === seleccionado)
      if (huesped) {
        router.push(`/huespedes/editar/${huesped.tipoDocumento}/${huesped.numeroDocumento}`)
      }
    } else {
      // CASO B: No hay seleccionado -> Vamos a ALTA (CU09)
      router.push("/huespedes/nuevo")
    }
  }

  // Redirige a la página de alta
  const irAAlta = () => {
    router.push("/huespedes/nuevo")
  }

  // --- LÓGICA ALTA (Modal) ---
  const handleAlta = async () => {
    setErrorAlta(null)
    try {
      await crearHuesped(nuevoHuesped)
      alert("✅ Huésped creado correctamente")
      setMostrarFormAlta(false)
      handleBuscar() // Refrescar lista
    } catch (err: any) {
      if (err.status === 400) setErrorAlta({ message: err.message, esDuplicado: true })
      else alert("Error: " + err.message)
    }
  }

  const handleForzarAlta = async () => {
    try {
      await crearHuespedForzado(nuevoHuesped)
      alert("✅ Huésped creado (Forzado)")
      setMostrarFormAlta(false)
      handleBuscar()
    } catch (err) {
      alert("Error al forzar alta")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-red-700 drop-shadow-md font-serif tracking-wider">
          BUSCAR HUÉSPED (CU02)
        </h1>
        <button
          onClick={() => router.push("/principal")}
          className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-black hover:bg-red-600 shadow-md"
        >
          X
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-1 font-serif">Datos del Huésped</h2>

        {/* FORMULARIO DE BÚSQUEDA */}
        <div className="bg-gradient-to-b from-sky-200 to-gray-300 border border-gray-500 p-8 rounded-md shadow-md mb-6 relative">
          <div className="grid gap-4 max-w-2xl mx-auto">
            {/* NOMBRE */}
            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Nombre:</label>
              <input
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner uppercase"
                placeholder="Ingrese el Nombre"
                value={filtros.nombre}
                onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value.toUpperCase() })}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>

            {/* APELLIDO */}
            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Apellido:</label>
              <input
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner uppercase"
                placeholder="Ingrese el Apellido"
                value={filtros.apellido}
                onChange={(e) => setFiltros({ ...filtros, apellido: e.target.value.toUpperCase() })}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>

            {/* TIPO DOC */}
            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Tipo de Documento:</label>
              <select
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner uppercase"
                value={filtros.tipoDoc}
                onChange={(e) => setFiltros({ ...filtros, tipoDoc: e.target.value })}
              >
                <option value="">Seleccione...</option>
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="LE">LE</option>
                <option value="LC">LC</option>
              </select>
            </div>

            {/* NUM DOC */}
            <div className="flex items-center">
              <label className="w-48 font-bold text-lg text-right mr-4 font-serif">Documento:</label>
              <input
                className="flex-1 border border-gray-400 p-1.5 rounded shadow-inner uppercase"
                placeholder="Ingrese el Número de Documento"
                value={filtros.numDoc}
                onChange={(e) => setFiltros({ ...filtros, numDoc: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <button
              onClick={handleBuscar}
              disabled={cargando}
              className="bg-sky-200 border-2 border-sky-400 text-black font-bold px-10 py-1.5 rounded hover:bg-sky-300 shadow-sm font-serif transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>

        {/* LISTA DE RESULTADOS CON ORDENAMIENTO */}
        <h2 className="text-xl font-bold mb-1 font-serif">Lista de Huéspedes</h2>

        <div className="border border-gray-500 bg-white min-h-[200px] relative">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full border-collapse text-center">
              <thead className="sticky top-0 bg-sky-100 shadow-sm z-10 cursor-pointer select-none">
                <tr>
                  <th
                    onClick={() => handleOrdenar("apellido")}
                    className="border border-gray-400 p-2 font-serif hover:bg-sky-200 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">Apellido {renderSortIcon("apellido")}</div>
                  </th>
                  <th
                    onClick={() => handleOrdenar("nombre")}
                    className="border border-gray-400 p-2 font-serif hover:bg-sky-200 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">Nombre {renderSortIcon("nombre")}</div>
                  </th>
                  <th
                    onClick={() => handleOrdenar("tipoDocumento")}
                    className="border border-gray-400 p-2 font-serif hover:bg-sky-200 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">Tipo {renderSortIcon("tipoDocumento")}</div>
                  </th>
                  <th
                    onClick={() => handleOrdenar("numeroDocumento")}
                    className="border border-gray-400 p-2 font-serif hover:bg-sky-200 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      Documento {renderSortIcon("numeroDocumento")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultadosOrdenados.length > 0 ? (
                  resultadosOrdenados.map((h: any) => (
                    <tr
                      key={h.id}
                      onClick={() => setSeleccionado(h.id)}
                      className={`cursor-pointer border-b hover:bg-yellow-100 transition-colors ${seleccionado === h.id ? "bg-blue-200" : ""}`}
                    >
                      <td className="border-r border-gray-300 p-2">{h.apellido}</td>
                      <td className="border-r border-gray-300 p-2">{h.nombre}</td>
                      <td className="border-r border-gray-300 p-2">{h.tipoDocumento}</td>
                      <td className="p-2">{h.numeroDocumento}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                      {mensaje || "Utilice el formulario para buscar."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTONES ACCIÓN */}
        <div className="flex justify-center mt-6 gap-6">
          <button
            onClick={handleSiguiente}
            className="bg-sky-200 border-2 border-sky-400 text-black font-bold px-12 py-1.5 rounded hover:bg-sky-300 shadow-sm font-serif text-lg transition-all active:scale-95"
          >
            SIGUIENTE
          </button>
        </div>

        {/* MODAL 4.A - NO HAY RESULTADOS */}
        {mostrarModalNoResultados && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
            <div className="bg-white p-8 rounded-lg shadow-2xl border-t-8 border-yellow-400 w-[500px] text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No existe ninguna concordancia</h3>
              <p className="text-gray-600 mb-6">
                Según los criterios de búsqueda ingresados, no se encontró ningún huésped.
                <br />
                <br />
                <strong>El sistema pasará a ejecutar el Alta de Huésped.</strong>
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setMostrarModalNoResultados(false)}
                  className="px-6 py-2 border-2 border-gray-400 text-gray-600 font-bold rounded hover:bg-gray-100 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={irAAlta}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-lg transition-colors"
                  autoFocus
                >
                  ACEPTAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE ALTA */}
      {mostrarFormAlta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 border-2 border-gray-400">
            <h3 className="font-serif font-bold text-xl mb-4 text-center">Nuevo Huésped</h3>
            <div className="space-y-3">
              <input
                placeholder="Nombre"
                className="w-full border p-2 rounded"
                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, nombre: e.target.value })}
              />
              <input
                placeholder="Apellido"
                className="w-full border p-2 rounded"
                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, apellido: e.target.value })}
              />
              <select
                className="w-full border p-2 rounded"
                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, tipoDocumento: e.target.value })}
              >
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="LE">LE</option>
                <option value="LC">LC</option>
              </select>
              <input
                placeholder="Nro Documento"
                className="w-full border p-2 rounded"
                onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, numeroDocumento: e.target.value })}
              />
            </div>

            {errorAlta && (
              <div className="mt-4 p-2 bg-red-100 text-red-800 text-sm rounded">
                {errorAlta.message}
                {errorAlta.esDuplicado && (
                  <button
                    onClick={handleForzarAlta}
                    className="mt-2 w-full bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Forzar Guardado
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setMostrarFormAlta(false)}
                className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAlta}
                className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
