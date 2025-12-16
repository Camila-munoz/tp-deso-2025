"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { buscarHuespedes, crearHuesped, crearHuespedForzado } from "@/services/api"
import Link from "next/link"
// Iconos modernos
import { ArrowLeft, Search, ArrowUp, ArrowDown, ArrowUpDown, UserPlus, AlertTriangle, X, Check } from "lucide-react"

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

  // Estados para Alta (Modal Interno)
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
    setOrden(null)

    try {
      const data = await buscarHuespedes(filtros)

      if (data.success) {
        setResultados(data.data)
      } else {
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
        return { columna, direccion: prev.direccion === "asc" ? "desc" : "asc" }
      }
      return { columna, direccion: "asc" }
    })
  }

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

  const renderSortIcon = (columna: string) => {
    if (orden?.columna !== columna) return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />
    return orden.direccion === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
  }

  // --- LÓGICA SIGUIENTE ---
  const handleSiguiente = () => {
    if (seleccionado) {
      const huesped = resultados.find((h) => h.id === seleccionado)
      if (huesped) {
        router.push(`/huespedes/editar/${huesped.tipoDocumento}/${huesped.numeroDocumento}`)
      }
    } else {
      router.push("/huespedes/nuevo")
    }
  }

  const irAAlta = () => router.push("/huespedes/nuevo")

  // --- LÓGICA ALTA ---
  const handleAlta = async () => {
    setErrorAlta(null)
    try {
      await crearHuesped(nuevoHuesped)
      alert("✅ Huésped creado correctamente")
      setMostrarFormAlta(false)
      handleBuscar()
    } catch (err: any) {
      if (err.status === 400) setErrorAlta({ message: err.message, esDuplicado: true })
      else alert("Error: " + err.message)
    }
  }

  const handleForzarAlta = async () => {
    try {
      await crearHuespedForzado(nuevoHuesped)
      alert("Huésped creado (Forzado)")
      setMostrarFormAlta(false)
      handleBuscar()
    } catch (err) {
      alert("Error al forzar alta")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900 flex flex-col">
      
      <div className="max-w-5xl mx-auto w-full flex-grow">
        
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Buscar Huésped</h1>
            <p className="text-gray-500 text-sm mt-1">Consulte el padrón o registre un nuevo cliente.</p>
        </div>

        {/* FORMULARIO DE BÚSQUEDA */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre</label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase placeholder-gray-400"
                    placeholder="NOMBRE"
                    value={filtros.nombre}
                    onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value.toUpperCase() })}
                    onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Apellido</label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase placeholder-gray-400"
                    placeholder="APELLIDO"
                    value={filtros.apellido}
                    onChange={(e) => setFiltros({ ...filtros, apellido: e.target.value.toUpperCase() })}
                    onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                  />
               </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo Doc</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={filtros.tipoDoc}
                        onChange={(e) => setFiltros({ ...filtros, tipoDoc: e.target.value })}
                    >
                        <option value="">Todos</option>
                        <option value="DNI">DNI</option>
                        <option value="PASAPORTE">PASAPORTE</option>
                        <option value="LE">LE</option>
                        <option value="LC">LC</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Documento</label>
                    <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400"
                        placeholder="NÚMERO"
                        value={filtros.numDoc}
                        onChange={(e) => setFiltros({ ...filtros, numDoc: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                    />
                  </div>
               </div>
               
               <div className="pt-1">
                 <button
                    onClick={handleBuscar}
                    disabled={cargando}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                 >
                    {cargando ? "Buscando..." : <><Search size={18}/> Buscar</>}
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* LISTA DE RESULTADOS */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 min-h-[300px] flex flex-col">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800">Resultados</h2>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{resultados.length} encontrados</span>
           </div>
           
           <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      { key: "apellido", label: "Apellido" },
                      { key: "nombre", label: "Nombre" },
                      { key: "tipoDocumento", label: "Tipo" },
                      { key: "numeroDocumento", label: "Documento" }
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleOrdenar(col.key)}
                        className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label} {renderSortIcon(col.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {resultadosOrdenados.length > 0 ? (
                    resultadosOrdenados.map((h: any) => (
                      <tr
                        key={h.id}
                        onClick={() => setSeleccionado(h.id)}
                        className={`cursor-pointer transition-colors ${seleccionado === h.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{h.apellido}</td>
                        <td className="px-6 py-4 text-gray-600">{h.nombre}</td>
                        <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs font-bold">{h.tipoDocumento}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono">{h.numeroDocumento}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400">
                        {mensaje ? (
                            <div className="flex flex-col items-center gap-2">
                                <AlertTriangle className="text-amber-400" size={32}/>
                                <p>{mensaje}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Search className="opacity-20" size={48}/>
                                <p>Utilice el formulario para buscar huéspedes.</p>
                            </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
           
           {/* ACCIONES INFERIORES */}
           <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={handleSiguiente}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 transform active:scale-95"
              >
                {seleccionado ? "Modificar Seleccionado" : "Crear Nuevo Huésped"}
                <ArrowLeft className="rotate-180" size={18}/>
              </button>
           </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-8 text-center text-gray-400 text-sm pb-6">
          <p>© 2025 Hotel Premier - Sistema de Gestión</p>
          <p className="text-xs mt-1 opacity-70">Diseño de Sistemas - TP Final</p>
      </footer>

      {/* --- MODALES --- */}

      {/* MODAL 4.A - NO HAY RESULTADOS */}
      {mostrarModalNoResultados && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[480px] text-center relative border-t-8 border-amber-400">
            <button onClick={() => setMostrarModalNoResultados(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sin Resultados</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              No se encontró ningún huésped con esos criterios.
              <br/><strong>¿Desea dar de alta uno nuevo?</strong>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModalNoResultados(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={irAAlta}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg"
              >
                Sí, Alta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ALTA RÁPIDA (Opcional, si se usa) */}
      {mostrarFormAlta && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[400px]">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Alta Rápida</h3>
            <div className="space-y-4">
              <input placeholder="Nombre" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, nombre: e.target.value })} />
              <input placeholder="Apellido" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, apellido: e.target.value })} />
              <select className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white" onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, tipoDocumento: e.target.value })}>
                <option value="DNI">DNI</option><option value="PASAPORTE">PASAPORTE</option>
              </select>
              <input placeholder="Documento" className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setNuevoHuesped({ ...nuevoHuesped, numeroDocumento: e.target.value })} />
            </div>

            {errorAlta && (
              <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-100">
                <p className="font-bold mb-1">Error:</p>
                {errorAlta.message}
                {errorAlta.esDuplicado && (
                  <button onClick={handleForzarAlta} className="mt-2 w-full bg-rose-500 text-white py-1.5 rounded-lg font-bold hover:bg-rose-600 text-xs">Forzar Guardado</button>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarFormAlta(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleAlta} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}