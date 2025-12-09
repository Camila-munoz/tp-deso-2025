"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { crearHuesped, crearHuespedForzado } from "@/services/api"

export default function AltaHuespedPage() {
  const router = useRouter()

  // --- FORMULARIO ---
 
  const initialState = {
    apellido: "",
    nombre: "",
    fechaNacimiento: "",
    tipoDocumento: "",
    numeroDocumento: "",
    cuit: "",
    posicionIVA: "",
    telefono: "",
    email: "",
    nacionalidad: "",
    ocupacion: "",
    // Dirección
    calle: "",
    numero: "",
    departamento: "",
    piso: "",
    codigoPostal: "",
    localidad: "",
    provincia: "",
    pais: "",
  }

  const [form, setForm] = useState(initialState)
  const [errores, setErrores] = useState<string[]>([])

  // --- ESTADOS DE UI ---
  const [modalExito, setModalExito] = useState(false)
  const [modalDuplicado, setModalDuplicado] = useState<string | null>(null) // Mensaje de error si hay duplicado
  const [cargando, setCargando] = useState(false)

  const camposMayusculas = [
    "apellido",
    "nombre",
    "tipoDocumento",
    "numeroDocumento",
    "cuit",
    "posicionIVA",
    "telefono",
    "nacionalidad",
    "ocupacion",
    "calle",
    "numero",
    "departamento",
    "piso",
    "codigoPostal",
    "localidad",
    "provincia",
    "pais",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newValue = camposMayusculas.includes(name) ? value.toUpperCase() : value
    setForm({ ...form, [name]: newValue })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, callback?: () => void) => {
    if (e.key === "Enter" && callback) {
      e.preventDefault()
      callback()
    }
  }

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, onClick: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onClick()
    }
  }

  const [modalCancelar, setModalCancelar] = useState(false)

  const validarCamposObligatorios = () => {
    const faltantes: string[] = []

    if (!form.apellido.trim()) faltantes.push("Apellido")
    if (!form.nombre.trim()) faltantes.push("Nombre")
    if (!form.fechaNacimiento.trim()) faltantes.push("Fecha de nacimiento")
    if (!form.tipoDocumento.trim()) faltantes.push("Tipo de documento")
    if (!form.numeroDocumento.trim()) faltantes.push("Número de documento")
    if (!form.posicionIVA.trim()) faltantes.push("Posición frente al IVA")
    if (!form.telefono.trim()) faltantes.push("Teléfono")
    if (!form.nacionalidad.trim()) faltantes.push("Nacionalidad")
    if (!form.ocupacion.trim()) faltantes.push("Ocupación")

    // Dirección
    if (!form.calle.trim()) faltantes.push("Calle")
    if (!form.numero.trim()) faltantes.push("Número")
    if (!form.codigoPostal.trim()) faltantes.push("Código Postal")
    if (!form.localidad.trim()) faltantes.push("Localidad")
    if (!form.provincia.trim()) faltantes.push("Provincia")
    if (!form.pais.trim()) faltantes.push("País")

    // VALIDACIÓN DE EMAIL (Regex estándar)
    // Verifica que tenga texto + @ + texto + . + texto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.email && !emailRegex.test(form.email)) {
      faltantes.push("El formato del Email no es válido (ejemplo: usuario@dominio.com)")
    }

    // VALIDACIÓN DE FECHA DE NACIMIENTO (No futura)
    if (form.fechaNacimiento) {
      const fechaNac = new Date(form.fechaNacimiento)
      const hoy = new Date()
      // Reseteamos horas para comparar solo fechas
      hoy.setHours(0, 0, 0, 0)
      if (fechaNac > hoy) {
        faltantes.push("La fecha de nacimiento no puede ser futura")
      }
    }
    if (form.tipoDocumento === "PASAPORTE" && form.numeroDocumento) {
        // Regex: ^ (inicio) [a-zA-Z]{3} (3 letras) \d{6} (6 números) $ (fin)
        if (!/^[a-zA-Z]{3}\d{6}$/.test(form.numeroDocumento)) {
            faltantes.push("El Pasaporte debe tener 3 letras seguidas de 6 números (ej: AAA123456)")
        }
    }
    // VALIDACIÓN DE TELÉFONO (Solo números, espacios, guiones y +)
    if (form.telefono && !/^[\d\s\-\+]+$/.test(form.telefono)) {
        faltantes.push("El Teléfono contiene caracteres inválidos")
    }

    // VALIDACIÓN DE DNI (Solo números si el tipo es DNI)
    if (form.tipoDocumento === "DNI" && form.numeroDocumento) {
        if (!/^\d+$/.test(form.numeroDocumento)) {
            faltantes.push("El DNI debe contener solo números")
        }
        if(form.numeroDocumento.length>8 || form.numeroDocumento.length<7){
          faltantes.push("El DNI debe contener como mínimo 7 dígitos y como máximo 8")
        }
    }

    // VALIDACIÓN DE CUIT (Solo números y guiones)
    if (form.cuit && !/^[\d\-]+$/.test(form.cuit)) {
        faltantes.push("El CUIT contiene caracteres inválidos")
    }

    // VALIDACIÓN DE CAMPOS NUMÉRICOS DE DIRECCIÓN
    // isNaN comprueba si NO es un número
    if (form.numero && isNaN(Number(form.numero))) {
        faltantes.push("El Número de la dirección debe ser un valor numérico")
    }
    if (form.piso && form.piso.trim() !== "" && isNaN(Number(form.piso))) {
        faltantes.push("El Piso debe ser un valor numérico")
    }

    // VALIDACIÓN OCUPACIÓN: Debe contener al menos una letra
    // Esto evita inputs como "!", "?", "...", "123"
    if (form.ocupacion && !/[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(form.ocupacion)) {
        faltantes.push("La ocupación ingresada no es válida (debe contener letras)")
    }

    // SOLO LETRAS EN NOMBRE Y APELLIDO
    // Permite letras, espacios y acentos (\u00C0-\u00FF)
    const nombreRegex = /^[a-zA-Z\s\u00C0-\u00FF']+$/
    if (form.nombre && !nombreRegex.test(form.nombre)) {
        faltantes.push("El Nombre contiene caracteres inválidos (no use números ni símbolos)")
    }
    if (form.apellido && !nombreRegex.test(form.apellido)) {
        faltantes.push("El Apellido contiene caracteres inválidos")
    }

    // VALIDAR LONGITUD DE CUIT (11 dígitos numéricos)
    if (form.cuit) {
        // Quitamos guiones para contar solo números
        const cuitSoloNumeros = form.cuit.replace(/-/g, "")
        if (cuitSoloNumeros.length !== 11) {
             faltantes.push("El CUIT debe tener 11 dígitos")
        }
    }

    // VALIDAR LARGO CÓDIGO POSTAL (Entre 4 y 8 caracteres)
    if (form.codigoPostal && (form.codigoPostal.length < 4 || form.codigoPostal.length > 8)) {
        faltantes.push("El Código Postal parece incorrecto (verifique la longitud)")
    }
    return faltantes
  }

  // --- LÓGICA DE ENVÍO ---
  const handleSubmit = async (forzar = false) => {
    // --- 1. Validar campos obligatorios ---
    const faltantes = validarCamposObligatorios()

    if (faltantes.length > 0) {
      setErrores(faltantes)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setErrores([])
    setCargando(true)

    // --- 2. Armar estructura ---
    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numeroDocumento,
      cuit: form.cuit,
      posicionIVA: form.posicionIVA,
      telefono: form.telefono,
      email: form.email,
      fechaNacimiento: form.fechaNacimiento,
      nacionalidad: form.nacionalidad,
      ocupacion: form.ocupacion,
      direccion: {
        calle: form.calle,
        numero: Number(form.numero),
        departamento: form.departamento,
        piso: form.piso ? Number(form.piso) : null,
        codPostal: form.codigoPostal,
        localidad: form.localidad,
        provincia: form.provincia,
        pais: form.pais,
      },
    }

    try {
      // --- 3. Crear ---
      if (forzar) {
        await crearHuespedForzado(payload)
        setModalDuplicado(null)
      } else {
        await crearHuesped(payload)
      }

      // --- 4. Mostrar modal de éxito ---
      setModalExito(true)
    } catch (err: any) {
      // --- 5. Manejo caso duplicado ---
      if (err.status === 400 && !forzar) {
        setModalDuplicado(err.message || "El huésped ya existe.")
      } else {
        alert("Error al guardar: " + err.message)
      }
    } finally {
      setCargando(false)
    }
  }

  // --- LÓGICA ÉXITO ---
  const handleCargarOtro = (respuesta: boolean) => {
    setModalExito(false)
    if (respuesta) {
      // SI: Limpiar formulario y quedarse
      setForm(initialState)
    } else {
      // NO: Volver a la búsqueda
      router.push("http://localhost:3000/principal")
    }
  }

  const handleAceptarIgualmente = async () => {
    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numeroDocumento,
      cuit: form.cuit,
      posicionIVA: form.posicionIVA,
      telefono: form.telefono,
      email: form.email,
      fechaNacimiento: form.fechaNacimiento,
      nacionalidad: form.nacionalidad,
      ocupacion: form.ocupacion,
      direccion: {
        calle: form.calle,
        numero: form.numero ? Number(form.numero) : null,
        departamento: form.departamento,
        piso: form.piso ? Number(form.piso) : null,
        codPostal: form.codigoPostal,
        localidad: form.localidad,
        provincia: form.provincia,
        pais: form.pais,
      },
    }

    try {
      setCargando(true)

  
      const resultado = await crearHuespedForzado(payload)

      
      setModalDuplicado(null) 
      setModalExito(true) 
    } catch (err: any) {
      
      if (err && err.status) {
        setModalDuplicado(err.message || "Error al forzar el alta.")
      } else {
        alert("Error inesperado al forzar el alta: " + (err?.message || err))
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4 font-sans text-gray-900 relative">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        {/* Icono Usuario */}
        <div className="ml-4 mt-2">
          <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center text-white border-2 border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10" viewBox="0 0 16 16">
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4 1 1 1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1
          className="text-4xl font-bold text-red-700 drop-shadow-sm mt-4 tracking-wider"
          style={{ fontFamily: "serif" }}
        >
          DAR DE ALTA AL HUÉSPED
        </h1>

        {/* Botón Cerrar */}
        <button
          onClick={() => router.back()}
          className="mr-4 mt-2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-black hover:bg-red-700 shadow-md text-xl"
        >
          X
        </button>
      </div>

      {/* --- FORMULARIO --- */}
      <div className="max-w-6xl mx-auto bg-gray-200 px-10 pb-10">
        {/* SECCIÓN DATOS PERSONALES */}
        {errores.length > 0 && (
          <div className="bg-red-200 border border-red-600 text-red-800 p-4 mb-6">
            <h3 className="font-bold text-lg mb-2">Debe completar los siguientes campos obligatorios:</h3>
            <ul className="list-disc ml-6">
              {errores.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="text-2xl font-bold text-sky-400 mb-4" style={{ textShadow: "1px 1px 0 #fff" }}>
          Datos Personales
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block font-bold mb-1">
              Apellido <span className="text-red-600">(*)</span>
            </label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese el Apellido"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">
              Nombre/s <span className="text-red-600">(*)</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese el Nombre"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">
              Fecha de nacimiento <span className="text-red-600">(*)</span>
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="w-full border border-gray-500 p-1.5 rounded"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">
              Tipo de Documento <span className="text-red-600">(*)</span>
            </label>
            <select
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange}
              className="w-full border border-gray-500 p-1.5 rounded bg-white"
            >
              <option value="">Seleccionar</option>
              <option value="DNI">DNI</option>
              <option value="PASAPORTE">PASAPORTE</option>
              <option value="LE">LE</option>
              <option value="LC">LC</option>
              <option value="OTRO">OTRO</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">
              Documento <span className="text-red-600">(*)</span>
            </label>
            <input
              name="numeroDocumento"
              value={form.numeroDocumento}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese el Documento"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">CUIT</label>
            <input
              name="cuit"
              value={form.cuit}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese el CUIT"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">
              Posición frente al IVA <span className="text-red-600">(*)</span>
            </label>
            <select
              name="posicionIVA"
              value={form.posicionIVA}
              onChange={handleChange}
              className="w-full border border-gray-500 p-1.5 rounded bg-white"
            >
              <option value="">Seleccionar</option>
              <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
              <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
              <option value="MONOTRIBUTO">Monotributo</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">
              Teléfono <span className="text-red-600">(*)</span>
            </label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese el número"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese el Email"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">
              Nacionalidad <span className="text-red-600">(*)</span>
            </label>
            <input
              name="nacionalidad"
              value={form.nacionalidad}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Seleccionar"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">
              Ocupación <span className="text-red-600">(*)</span>
            </label>
            <input
              name="ocupacion"
              value={form.ocupacion}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese la ocupación"
            />
          </div>
          
          <div></div>
        </div>

        {/* SECCIÓN DIRECCIÓN */}
        <h2
          className="text-2xl font-bold text-sky-400 mb-4 border-b-2 border-sky-400 inline-block w-full"
          style={{ textShadow: "1px 1px 0 #fff" }}
        >
          Dirección
        </h2>

        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          {/* Fila 1 */}
          <div className="col-span-1">
            <label className="block font-bold mb-1">
              Calle <span className="text-red-600">(*)</span>
            </label>
            <input
              name="calle"
              value={form.calle}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese la Calle"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">
                Número <span className="text-red-600">(*)</span>
              </label>
              <input
                name="numero"
                value={form.numero}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
                className="w-full border border-gray-500 p-1.5 rounded"
                placeholder="Ingrese el Número"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Departamento</label>
              <input
                name="departamento"
                value={form.departamento}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
                className="w-full border border-gray-500 p-1.5 rounded"
                placeholder="Ingrese el Depto"
              />
            </div>
          </div>

          {/* Fila 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Piso</label>
              <input
                name="piso"
                value={form.piso}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
                className="w-full border border-gray-500 p-1.5 rounded"
                placeholder="Ingrese el Piso"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">
                Código postal <span className="text-red-600">(*)</span>
              </label>
              <input
                name="codigoPostal"
                value={form.codigoPostal}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
                className="w-full border border-gray-500 p-1.5 rounded"
                placeholder="Ingrese el número"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold mb-1">
              Localidad <span className="text-red-600">(*)</span>
            </label>
            <input
              name="localidad"
              value={form.localidad}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese la localidad"
            />
          </div>

          {/* Fila 3 */}
          <div>
            <label className="block font-bold mb-1">
              Provincia <span className="text-red-600">(*)</span>
            </label>
            <input
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Ingrese la provincia"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">
              País <span className="text-red-600">(*)</span>
            </label>
            <input
              name="pais"
              value={form.pais}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, () => handleSubmit(false))}
              className="w-full border border-gray-500 p-1.5 rounded"
              placeholder="Seleccionar el país"
            />
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex justify-between mt-12 px-16">
          <button
            onClick={() => handleSubmit(false)}
            onKeyDown={(e) => handleButtonKeyDown(e, () => handleSubmit(false))}
            className="bg-sky-300 border border-black px-12 py-2 font-bold shadow-md hover:bg-sky-400 active:translate-y-1 w-48"
          >
            {cargando ? "Guardando..." : "Siguiente"}
          </button>

          {/* BOTÓN CANCELAR */}
          <button
            onClick={() => setModalCancelar(true)}
            onKeyDown={(e) => handleButtonKeyDown(e, () => setModalCancelar(true))}
            className="bg-red-600 text-white border border-black px-12 py-2 font-bold shadow-md hover:bg-red-700 active:translate-y-1 w-48"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* --- MODAL ÉXITO --- */}
      {modalExito && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-200 border-2 border-gray-500 shadow-2xl p-8 w-[600px] text-center">
            <h2 className="text-2xl font-bold font-serif mb-6 leading-relaxed">
              El huésped{" "}
              <span className="italic">
                {form.nombre} {form.apellido}
              </span>{" "}
              ha sido
              <br />
              satisfactoriamente cargado al sistema.
              <br />
              ¿Desea cargar otro?
            </h2>

            <div className="flex justify-center gap-16 mt-8">
              <button
                onClick={() => handleCargarOtro(true)}
                onKeyDown={(e) => handleButtonKeyDown(e, () => handleCargarOtro(true))}
                className="bg-lime-400 border border-black px-10 py-2 font-bold text-lg shadow hover:bg-lime-500 w-32"
              >
                SI
              </button>
              <button
                onClick={() => handleCargarOtro(false)}
                onKeyDown={(e) => handleButtonKeyDown(e, () => handleCargarOtro(false))}
                className="bg-red-500 border border-black px-10 py-2 font-bold text-lg text-white shadow hover:bg-red-600 w-32"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ERROR --- */}
      {modalDuplicado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-red-600 shadow-2xl p-8 w-[500px] text-center">
            <h3 className="text-xl font-bold text-red-600 mb-4">CUIDADO!</h3>
            <p className="mb-6 font-medium">{modalDuplicado}</p>
            <p className="mb-4 text-sm">¿Desea guardarlo igualmente?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleSubmit(true)}
                onKeyDown={(e) => handleButtonKeyDown(e, () => handleSubmit(true))}
                className="bg-red-600 text-white px-4 py-2 rounded font-bold"
              >
                ACEPTAR IGUALMENTE
              </button>
              <button
                onClick={() => setModalDuplicado(null)}
                onKeyDown={(e) => handleButtonKeyDown(e, () => setModalDuplicado(null))}
                className="bg-gray-300 px-4 py-2 rounded font-bold"
              >
                CORREGIR
              </button>
            </div>
          </div>
        </div>
      )}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-gray-600 p-8 w-[500px] text-center shadow-2xl">
            <h3 className="text-xl font-bold mb-4">¿Desea cancelar el alta del huésped?</h3>

            <div className="flex justify-center gap-6 mt-6">
              {/* --- SI → Terminar CU y volver al inicio --- */}
              <button
                onClick={() => {
                  setModalCancelar(false)
                  router.push("http://localhost:3000/principal")
                }}
                onKeyDown={(e) =>
                  handleButtonKeyDown(e, () => {
                    setModalCancelar(false)
                    router.push("http://localhost:3000/principal")
                  })
                }
                className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700"
              >
                SI
              </button>

              {/* --- NO → Cerrar modal y mantener datos --- */}
              <button
                onClick={() => setModalCancelar(false)}
                onKeyDown={(e) => handleButtonKeyDown(e, () => setModalCancelar(false))}
                className="bg-gray-300 px-6 py-2 rounded font-bold hover:bg-gray-400"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
