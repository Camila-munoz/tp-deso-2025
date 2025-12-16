"use client";
import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { crearHuesped, crearHuespedForzado } from "@/services/api";
// Iconos modernos
import { ArrowLeft, Save, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

// Componentes UI internos modernizados
const InputField = ({ label, name, value, onChange, onKeyDown, placeholder, type = "text", error }: any) => (
  <div className="w-full">
    <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${error ? "text-rose-500" : "text-gray-500"}`}>
      {label}
    </label>
    <input 
      type={type}
      name={name}
      value={value} 
      onChange={onChange} 
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-medium text-gray-900 
        ${error ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
        bg-white placeholder-gray-400
      `} 
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error }: any) => (
  <div className="w-full">
    <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${error ? "text-rose-500" : "text-gray-500"}`}>
      {label}
    </label>
    <select 
      name={name}
      value={value} 
      onChange={onChange} 
      className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-medium text-gray-900 appearance-none bg-white
        ${error ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
      `}
    >
      <option value="">Seleccionar</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default function AltaHuespedPage() {
  const router = useRouter();

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
  };

  const [form, setForm] = useState(initialState);
  const [errores, setErrores] = useState<string[]>([]);

  // --- ESTADOS DE UI ---
  const [modalExito, setModalExito] = useState(false);
  const [modalDuplicado, setModalDuplicado] = useState<string | null>(null); // Mensaje de error si hay duplicado
  const [cargando, setCargando] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);

  const camposMayusculas = [
    "apellido", "nombre", "tipoDocumento", "numeroDocumento", "cuit", "posicionIVA",
    "telefono", "nacionalidad", "ocupacion", "calle", "numero", "departamento",
    "piso", "codigoPostal", "localidad", "provincia", "pais",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = camposMayusculas.includes(name) ? value.toUpperCase() : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, callback?: () => void) => {
    if (e.key === "Enter" && callback) {
      e.preventDefault();
      callback();
    }
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, onClick: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onClick();
    }
  };

  const validarCamposObligatorios = () => {
    const faltantes: string[] = [];

    if (!form.apellido.trim()) faltantes.push("Apellido");
    if (!form.nombre.trim()) faltantes.push("Nombre");
    if (!form.fechaNacimiento.trim()) faltantes.push("Fecha de nacimiento");
    if (!form.tipoDocumento.trim()) faltantes.push("Tipo de documento");
    if (!form.numeroDocumento.trim()) faltantes.push("Número de documento");
    if (!form.posicionIVA.trim()) faltantes.push("Posición frente al IVA");
    if (!form.telefono.trim()) faltantes.push("Teléfono");
    if (!form.nacionalidad.trim()) faltantes.push("Nacionalidad");
    if (!form.ocupacion.trim()) faltantes.push("Ocupación");

    // Dirección
    if (!form.calle.trim()) faltantes.push("Calle");
    if (!form.numero.trim()) faltantes.push("Número");
    if (!form.codigoPostal.trim()) faltantes.push("Código Postal");
    if (!form.localidad.trim()) faltantes.push("Localidad");
    if (!form.provincia.trim()) faltantes.push("Provincia");
    if (!form.pais.trim()) faltantes.push("País");

    // VALIDACIÓN DE EMAIL
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (form.email && !emailRegex.test(form.email)) {
      faltantes.push("El formato del Email no es válido (ejemplo: usuario@dominio.com).");
    }

    // VALIDACIÓN DE FECHA DE NACIMIENTO
    if (form.fechaNacimiento) {
      const fechaNac = new Date(form.fechaNacimiento);
      const hoy = new Date();
      const fechaHoySoloFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      if (fechaNac > fechaHoySoloFecha) {
        faltantes.push("La fecha de nacimiento no puede ser futura");
      }
      const fechaMayorEdad = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
      const fechaMaxima = new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate());
      
      if (fechaNac > fechaMayorEdad) {
        faltantes.push("El huésped debe ser mayor de 18 años.");
      }
      if (fechaNac < fechaMaxima) {
        faltantes.push("La fecha de nacimiento es inválida o demasiado antigua.");
      }
    }

    if (form.tipoDocumento === "PASAPORTE" && form.numeroDocumento) {
        if (!/^[a-zA-Z]{3}\d{6}$/.test(form.numeroDocumento)) {
            faltantes.push("El Pasaporte debe tener 3 letras seguidas de 6 números (ej: AAA123456)");
        }
    }

    // VALIDACIÓN DE TELÉFONO
    const telefonoRegex = /^\+?[0-9]{5,20}$/; 
    if (form.telefono && !telefonoRegex.test(form.telefono)) {
      faltantes.push("El formato del Teléfono es inválido. Debe contener números y opcionalmente el signo '+' al inicio.");
    }

    // VALIDACIÓN DE DNI
    if (form.tipoDocumento === "DNI" && form.numeroDocumento) {
        if (!/^\d+$/.test(form.numeroDocumento)) {
            faltantes.push("El DNI debe contener solo números");
        }
        if(form.numeroDocumento.length > 8 || form.numeroDocumento.length < 7){
          faltantes.push("El DNI debe contener como mínimo 7 dígitos y como máximo 8");
        }
    }

    // VALIDACIÓN DE CUIT
    if (form.cuit) {
        if (form.cuit.startsWith("-")) {
            faltantes.push("El CUIT no puede ser negativo.");
        }
        if (!/^[\d\-]+$/.test(form.cuit)) {
            faltantes.push("El CUIT contiene caracteres inválidos (solo números y guiones)");
        }
        const cuitSoloNumeros = form.cuit.replace(/-/g, "");
        if (cuitSoloNumeros.length !== 11) {
            faltantes.push("El CUIT debe tener 11 dígitos");
        }
    }

    const numDir = Number(form.numero);
    if (!isNaN(numDir) && numDir <= 0) {
        faltantes.push("El Número de calle debe ser un valor numérico positivo.");
    }
    
    if (form.piso && form.piso.trim() !== "") {
        const pisoDir = Number(form.piso);
        if (isNaN(pisoDir)) {
            faltantes.push("El Piso debe ser un valor numérico.");
        } else if (pisoDir < 0) {
            faltantes.push("El Piso no puede ser negativo.");
        }
    }
    
    if (form.codigoPostal) {
      if (!/^\d{3,4}$/.test(form.codigoPostal)) {
        faltantes.push("El Código Postal debe ser numérico y tener entre 3 y 4 dígitos.");
      }
    }

    if (form.numero && isNaN(Number(form.numero))) {
        faltantes.push("El Número de la dirección debe ser un valor numérico");
    }
    if (form.piso && form.piso.trim() !== "" && isNaN(Number(form.piso))) {
        faltantes.push("El Piso debe ser un valor numérico");
    }

    if (form.ocupacion && !/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(form.ocupacion)) {
      faltantes.push("La Ocupación debe contener sólo letras y espacios.");
    }

    const alfanumericoRegex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s,.'-]*$/;
    const soloAlfabeticoRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s,.'-]*$/;
    
    if (form.nacionalidad && !soloAlfabeticoRegex.test(form.nacionalidad)) faltantes.push("La Nacionalidad contiene caracteres inválidos.");
    if (form.localidad && !soloAlfabeticoRegex.test(form.localidad)) faltantes.push("La Localidad contiene caracteres inválidos.");
    if (form.provincia && !soloAlfabeticoRegex.test(form.provincia)) faltantes.push("La Provincia contiene caracteres inválidos.");
    if (form.pais && !soloAlfabeticoRegex.test(form.pais)) faltantes.push("El País contiene caracteres inválidos.");
    if (form.calle && !alfanumericoRegex.test(form.calle)) faltantes.push("La Calle contiene caracteres inválidos.");

    const nombreRegex = /^[a-zA-Z\s\u00C0-\u00FF']+$/;
    if (form.nombre && !nombreRegex.test(form.nombre)) faltantes.push("El Nombre contiene caracteres inválidos (no use números ni símbolos)");
    if (form.apellido && !nombreRegex.test(form.apellido)) faltantes.push("El Apellido contiene caracteres inválidos");

    return faltantes;
  };

  // --- LÓGICA DE ENVÍO ---
  const handleSubmit = async (forzar = false) => {
    const faltantes = validarCamposObligatorios();

    if (faltantes.length > 0) {
      setErrores(faltantes);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrores([]);
    setCargando(true);

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
    };

    try {
      if (forzar) {
        await crearHuespedForzado(payload);
        setModalDuplicado(null);
      } else {
        await crearHuesped(payload);
      }
      setModalExito(true);
    } catch (err: any) {
      if (err.status === 400 && !forzar) {
        setModalDuplicado(err.message || "El huésped ya existe.");
      } else {
        alert("Error al guardar: " + err.message);
      }
    } finally {
      setCargando(false);
    }
  };

  // --- LÓGICA ÉXITO ---
  const handleCargarOtro = (respuesta: boolean) => {
    setModalExito(false);
    if (respuesta) {
      setForm(initialState);
    } else {
      router.push("/principal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900 relative">
      
      <div className="max-w-5xl mx-auto">
        {/* HEADER / BACK BUTTON */}
        <div className="w-full mb-8 flex items-center justify-between">
             <Link href="/principal" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <ArrowLeft size={20} />
                </div>
                <span>Volver al Menú</span>
             </Link>
             
             <button onClick={() => setModalCancelar(true)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                <X size={20}/>
             </button>
        </div>

        {/* TÍTULO */}
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Alta de Huésped</h1>
            <p className="text-gray-500 text-sm mt-1">Complete los datos para registrar un nuevo cliente.</p>
        </div>

        {/* MENSAJE DE ERRORES */}
        {errores.length > 0 && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-rose-700">Campos requeridos faltantes o inválidos:</h4>
              <ul className="text-sm text-rose-600 mt-1 list-disc pl-4 space-y-1">
                {errores.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* FORMULARIO CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 mb-10">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="mb-10">
             <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-bold text-gray-900">Datos Personales</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="APELLIDO" />
                <InputField label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="NOMBRE" />
                <InputField label="Fecha Nacimiento *" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} />

                <SelectField label="Tipo Documento *" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} 
                  options={[
                    {value:"DNI", label:"DNI"}, {value:"PASAPORTE", label:"PASAPORTE"},
                    {value:"LE", label:"LE"}, {value:"LC", label:"LC"}, {value:"OTRO", label:"OTRO"}
                  ]} 
                />
                <InputField label="Documento *" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="NÚMERO" />
                <InputField label="CUIT" name="cuit" value={form.cuit} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="XX-XXXXXXXX-X" />

                <SelectField label="Posición IVA *" name="posicionIVA" value={form.posicionIVA} onChange={handleChange} 
                  options={[
                    {value:"CONSUMIDOR_FINAL", label:"Consumidor Final"},
                    {value:"RESPONSABLE_INSCRIPTO", label:"Responsable Inscripto"},
                    {value:"MONOTRIBUTO", label:"Monotributo"}
                  ]} 
                />
                <InputField label="Teléfono *" name="telefono" value={form.telefono} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="TELÉFONO" />
                <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="email@ejemplo.com" />

                <InputField label="Nacionalidad *" name="nacionalidad" value={form.nacionalidad} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="NACIONALIDAD" />
                <InputField label="Ocupación *" name="ocupacion" value={form.ocupacion} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="OCUPACIÓN" />
             </div>
          </div>

          {/* SECCIÓN 2: DIRECCIÓN */}
          <div>
             <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-bold text-gray-900">Domicilio</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-4"><InputField label="Calle *" name="calle" value={form.calle} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="CALLE" /></div>
                <div className="md:col-span-2"><InputField label="Número *" name="numero" value={form.numero} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="NÚMERO" /></div>
                
                <div className="md:col-span-2"><InputField label="Depto" name="departamento" value={form.departamento} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="DPTO" /></div>
                <div className="md:col-span-2"><InputField label="Piso" name="piso" value={form.piso} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="PISO" /></div>
                <div className="md:col-span-2"><InputField label="C. Postal *" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="CP" /></div>
                
                <div className="md:col-span-2"><InputField label="Localidad *" name="localidad" value={form.localidad} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="LOCALIDAD" /></div>
                <div className="md:col-span-2"><InputField label="Provincia *" name="provincia" value={form.provincia} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="PROVINCIA" /></div>
                <div className="md:col-span-2"><InputField label="País *" name="pais" value={form.pais} onChange={handleChange} onKeyDown={(e: any) => handleKeyDown(e, () => handleSubmit(false))} placeholder="PAÍS" /></div>
             </div>
          </div>

          {/* BOTONES ACCIÓN */}
          <div className="flex justify-end items-center gap-4 mt-12 pt-8 border-t border-gray-100">
             <button 
                onClick={() => setModalCancelar(true)} 
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
             >
               Cancelar
             </button>
             <button 
                onClick={() => handleSubmit(false)} 
                disabled={cargando} 
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
             >
               {cargando ? "Guardando..." : <><Save size={18}/> Guardar Huésped</>}
             </button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2025 Hotel Premier - Sistema de Gestión</p>
          <p className="text-xs mt-1 opacity-70">Diseño de Sistemas - TP Final</p>
        </footer>
      </div>

      {/* --- MODALES --- */}

      {/* ÉXITO */}
      {modalExito && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in zoom-in duration-200">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-[450px] text-center border border-gray-100">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Huésped Registrado!</h2>
            <p className="text-gray-500 mb-8 text-sm">
               <span className="font-bold text-gray-800">{form.apellido}, {form.nombre}</span> ha sido guardado correctamente.
               <br/>¿Desea cargar otro huésped?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => handleCargarOtro(false)} 
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
              >
                NO, Salir
              </button>
              <button 
                onClick={() => handleCargarOtro(true)} 
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg"
              >
                SÍ, Cargar otro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DUPLICADO */}
      {modalDuplicado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[480px] text-center border-t-8 border-amber-400 relative">
            <button onClick={() => setModalDuplicado(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Posible Duplicado</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">{modalDuplicado}<br/>¿Desea forzar el guardado?</p>
            
            <div className="flex gap-3">
              <button onClick={() => setModalDuplicado(null)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                Corregir
              </button>
              <button onClick={() => handleSubmit(true)} className="flex-1 py-3 bg-amber-400 text-amber-900 rounded-xl font-bold hover:bg-amber-500">
                Aceptar Igualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELAR */}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[400px] text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Cancelar Alta?</h3>
            <p className="text-gray-500 mb-8 text-sm">Se perderán todos los datos ingresados.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalCancelar(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                Seguir Editando
              </button>
              <button onClick={() => router.push("/principal")} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black">
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}