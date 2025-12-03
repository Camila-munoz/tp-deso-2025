"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearHuesped, crearHuespedForzado } from "@/services/api";

export default function AltaHuespedPage() {
  const router = useRouter();

  // --- ESTADO DEL FORMULARIO ---
  // Inicializamos todo vacío
  const initialState = {
    apellido: "", nombre: "", fechaNacimiento: "",
    tipoDocumento: "", numeroDocumento: "", cuit: "",
    posicionIVA: "", telefono: "", email: "",
    nacionalidad: "", ocupacion: "",
    // Dirección
    calle: "", numero: "", departamento: "",
    piso: "", codigoPostal: "", localidad: "",
    provincia: "", pais: ""
  };

  const [form, setForm] = useState(initialState);
  
  // --- ESTADOS DE UI ---
  const [modalExito, setModalExito] = useState(false);
  const [modalDuplicado, setModalDuplicado] = useState<string | null>(null); // Mensaje de error si hay duplicado
  const [cargando, setCargando] = useState(false);

  // Manejador de cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE ENVÍO ---
  const handleSubmit = async (forzar: boolean = false) => {
    setCargando(true);
    
    // 1. Armar el objeto con la estructura que espera el Backend (Dirección anidada)
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
        numero: Number(form.numero), // Convertir a número
        departamento: form.departamento,
        piso: form.piso ? Number(form.piso) : null,
        codPostal: form.codigoPostal,
        localidad: form.localidad,
        provincia: form.provincia,
        pais: form.pais
      }
    };

    try {
      if (forzar) {
        await crearHuespedForzado(payload);
        setModalDuplicado(null);
      } else {
        await crearHuesped(payload);
      }
      // Si todo sale bien:
      setModalExito(true);
    } catch (err: any) {
      if (err.status === 400 && !forzar) {
        // Es un duplicado (Error de validación del backend)
        setModalDuplicado(err.message || "El huésped ya existe.");
      } else {
        alert("Error al guardar: " + err.message);
      }
    } finally {
      setCargando(false);
    }
  };

  // --- LÓGICA DEL MODAL ÉXITO ---
  const handleCargarOtro = (respuesta: boolean) => {
    setModalExito(false);
    if (respuesta) {
      // SI: Limpiar formulario y quedarse
      setForm(initialState);
    } else {
      // NO: Volver a la búsqueda
      router.push("/huespedes");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 font-sans text-gray-900 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        {/* Icono Usuario */}
        <div className="ml-4 mt-2">
           <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center text-white border-2 border-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4 1 1 1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
             </svg>
           </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-red-700 drop-shadow-sm mt-4 tracking-wider" style={{ fontFamily: 'serif' }}>
          DAR DE ALTA AL HUÉSPED
        </h1>

        {/* Botón Cerrar */}
        <button onClick={() => router.back()} className="mr-4 mt-2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-black hover:bg-red-700 shadow-md text-xl">
          X
        </button>
      </div>

      {/* --- FORMULARIO --- */}
      <div className="max-w-6xl mx-auto bg-gray-200 px-10 pb-10">
        
{/* SECCIÓN DATOS PERSONALES (CORREGIDO) */}
        <h2 className="text-2xl font-bold text-sky-400 mb-4" style={{ textShadow: '1px 1px 0 #fff' }}>Datos Personales</h2>
        
        {/* Usamos una grilla de 3 columnas reales */}
        <div className="grid grid-cols-3 gap-6 mb-8">
            
            {/* --- FILA 1 --- */}
            <div>
              <label className="block font-bold mb-1">Apellido <span className="text-red-600">(*)</span></label>
              <input name="apellido" value={form.apellido} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el Apellido" />
            </div>
            <div>
              <label className="block font-bold mb-1">Nombre/s <span className="text-red-600">(*)</span></label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el Nombre" />
            </div>
            <div>
              <label className="block font-bold mb-1">Fecha de nacimiento <span className="text-red-600">(*)</span></label>
              <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" />
            </div>

            {/* --- FILA 2 --- */}
            <div>
              <label className="block font-bold mb-1">Tipo de Documento <span className="text-red-600">(*)</span></label>
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded bg-white">
                <option value="">Seleccionar</option>
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="LE">LE</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Documento <span className="text-red-600">(*)</span></label>
              <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el Documento" />
            </div>
            <div>
              <label className="block font-bold mb-1">CUIT</label>
              <input name="cuit" value={form.cuit} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el CUIT" />
            </div>

            {/* --- FILA 3 --- */}
            <div>
              <label className="block font-bold mb-1">Posición frente al IVA <span className="text-red-600">(*)</span></label>
              <select name="posicionIVA" value={form.posicionIVA} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded bg-white">
                <option value="">Seleccionar</option>
                <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
                <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
                <option value="MONOTRIBUTO">Monotributo</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Teléfono <span className="text-red-600">(*)</span></label>
              <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el número" />
            </div>
            <div>
              <label className="block font-bold mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el Email" />
            </div>

            {/* --- FILA 4 --- */}
            <div>
              <label className="block font-bold mb-1">Nacionalidad <span className="text-red-600">(*)</span></label>
              <input name="nacionalidad" value={form.nacionalidad} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Seleccionar" />
            </div>
            <div>
              <label className="block font-bold mb-1">Ocupación <span className="text-red-600">(*)</span></label>
              <input name="ocupacion" value={form.ocupacion} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese la ocupación" />
            </div>
            {/* Espacio vacío para completar la grilla */}
            <div></div>
        </div>

        {/* SECCIÓN DIRECCIÓN */}
        <h2 className="text-2xl font-bold text-sky-400 mb-4 border-b-2 border-sky-400 inline-block w-full" style={{ textShadow: '1px 1px 0 #fff' }}>Dirección</h2>

        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          {/* Fila 1 */}
          <div className="col-span-1">
             <label className="block font-bold mb-1">Calle <span className="text-red-600">(*)</span></label>
             <input name="calle" value={form.calle} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese la Calle" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block font-bold mb-1">Número <span className="text-red-600">(*)</span></label>
                <input name="numero" value={form.numero} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el Número" />
             </div>
             <div>
                <label className="block font-bold mb-1">Departamento</label>
                <input name="departamento" value={form.departamento} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el Depto" />
             </div>
          </div>

          {/* Fila 2 */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block font-bold mb-1">Piso</label>
                <input name="piso" value={form.piso} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el Piso" />
             </div>
             <div>
                <label className="block font-bold mb-1">Código postal <span className="text-red-600">(*)</span></label>
                <input name="codigoPostal" value={form.codigoPostal} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese el número" />
             </div>
          </div>
          <div>
             <label className="block font-bold mb-1">Localidad <span className="text-red-600">(*)</span></label>
             <input name="localidad" value={form.localidad} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese la localidad" />
          </div>

          {/* Fila 3 */}
          <div>
             <label className="block font-bold mb-1">Provincia <span className="text-red-600">(*)</span></label>
             <input name="provincia" value={form.provincia} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Ingrese la provincia" />
          </div>
          <div>
             <label className="block font-bold mb-1">País <span className="text-red-600">(*)</span></label>
             <input name="pais" value={form.pais} onChange={handleChange} className="w-full border border-gray-500 p-1.5 rounded" placeholder="Seleccionar el país" />
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex justify-between mt-12 px-16">
          <button 
            onClick={() => handleSubmit(false)}
            className="bg-sky-300 border border-black px-12 py-2 font-bold shadow-md hover:bg-sky-400 active:translate-y-1 w-48"
          >
            {cargando ? "Guardando..." : "Siguiente"}
          </button>

          <button 
            onClick={() => router.back()}
            className="bg-red-500 border border-black text-white px-12 py-2 font-bold shadow-md hover:bg-red-600 active:translate-y-1 w-48"
          >
            Cancelar
          </button>
        </div>

      </div>

      {/* --- MODAL ÉXITO (Imagen 2) --- */}
      {modalExito && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-200 border-2 border-gray-500 shadow-2xl p-8 w-[600px] text-center">
            
            <h2 className="text-2xl font-bold font-serif mb-6 leading-relaxed">
              El huésped <span className="italic">{form.nombre} {form.apellido}</span> ha sido<br/>
              satisfactoriamente cargado al sistema.<br/>
              ¿Desea cargar otro?
            </h2>

            <div className="flex justify-center gap-16 mt-8">
              <button 
                onClick={() => handleCargarOtro(true)}
                className="bg-lime-400 border border-black px-10 py-2 font-bold text-lg shadow hover:bg-lime-500 w-32"
              >
                SI
              </button>
              <button 
                onClick={() => handleCargarOtro(false)}
                className="bg-red-500 border border-black px-10 py-2 font-bold text-lg text-white shadow hover:bg-red-600 w-32"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ERROR DUPLICADO (Agregado para manejar el backend) --- */}
      {modalDuplicado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-red-600 shadow-2xl p-8 w-[500px] text-center">
            <h3 className="text-xl font-bold text-red-600 mb-4">¡Atención!</h3>
            <p className="mb-6 font-medium">{modalDuplicado}</p>
            <p className="mb-4 text-sm">¿Desea guardarlo igualmente?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => handleSubmit(true)} className="bg-red-600 text-white px-4 py-2 rounded font-bold">SI, FORZAR</button>
              <button onClick={() => setModalDuplicado(null)} className="bg-gray-300 px-4 py-2 rounded font-bold">CORREGIR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}