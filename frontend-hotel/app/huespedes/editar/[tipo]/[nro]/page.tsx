"use client";
import { useState, useEffect, useRef } from "react"; 
import { useRouter, useParams } from "next/navigation"; 
import { obtenerHuespedPorDocumento, modificarHuesped, modificarHuespedForzado, darBajaHuesped, verificarHuespedAlojado } from "@/services/api";
import Link from "next/link";
// Iconos modernos
import { ArrowLeft, Save, Trash2, X, AlertTriangle, CheckCircle, AlertCircle, Info } from "lucide-react";

// Componentes UI internos modernizados
const InputField = ({ label, name, value, onChange, error, type = "text", disabled = false, required = false, inputRef }: any) => (
  <div className="w-full">
    <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${error ? "text-rose-500" : "text-gray-500"}`}>
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input 
      ref={inputRef} 
      type={type}
      name={name}
      value={value || ""} 
      onChange={onChange} 
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-medium text-gray-900 
        ${type === 'text' && name !== 'email' ? 'uppercase' : ''} 
        ${error ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
        ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white'}
      `} 
    />
    {error && <p className="text-rose-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, error, options, disabled = false, required = false }: any) => (
  <div className="w-full">
    <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${error ? "text-rose-500" : "text-gray-500"}`}>
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select 
      name={name}
      value={value || ""} 
      onChange={onChange} 
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-medium text-gray-900 appearance-none bg-white
        ${error ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
        ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
      `}
    >
      <option value="">Seleccionar</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-rose-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
  </div>
);

export default function ModificarHuespedPage() {
  const router = useRouter();
  const params = useParams();
  
  const documentoRef = useRef<HTMLInputElement>(null);

  // Estados de Modales
  const [modalConfirmarBorrar, setModalConfirmarBorrar] = useState(false);
  const [modalExitoBorrar, setModalExitoBorrar] = useState(false);
  const [modalErrorBorrar, setModalErrorBorrar] = useState(false);
  const [modalExitoModificar, setModalExitoModificar] = useState(false);
  const [modalConfirmarCancelar, setModalConfirmarCancelar] = useState(false);
  const [modalCuidadoDuplicado, setModalCuidadoDuplicado] = useState(false);

  // Formulario
  const [form, setForm] = useState<any>({
    id: null,
    nombre: "", apellido: "", fechaNacimiento: "",
    tipoDocumento: "", numeroDocumento: "", cuit: "",
    posicionIVA: "", telefono: "", email: "",
    nacionalidad: "", ocupacion: "",
    calle: "", numero: "", departamento: "", piso: "",
    codigoPostal: "", localidad: "", provincia: "", pais: ""
  });

  const [errors, setErrors] = useState<any>({});
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Cargar datos
  useEffect(() => {
    if (!params?.tipo || !params?.nro) return;
    const cargarDatos = async () => {
      try {
        const data = await obtenerHuespedPorDocumento(String(params.tipo), String(params.nro));
        setForm({
          id: data.id,
          nombre: data.nombre,
          apellido: data.apellido,
          tipoDocumento: data.tipoDocumento,
          numeroDocumento: data.numeroDocumento,
          cuit: data.cuit || "",
          posicionIVA: data.posicionIVA,
          telefono: data.telefono,
          email: data.email || "",
          fechaNacimiento: data.fechaNacimiento,
          nacionalidad: data.nacionalidad,
          ocupacion: data.ocupacion,
          calle: data.direccion?.calle || "",
          numero: data.direccion?.numero || "",
          departamento: data.direccion?.departamento || "",
          piso: data.direccion?.piso || "",
          codigoPostal: data.direccion?.codPostal || "",
          localidad: data.direccion?.localidad || "",
          provincia: data.direccion?.provincia || "",
          pais: data.direccion?.pais || ""
        });
      } catch (error) {
        alert("Error al cargar los datos.");
        router.push("/huespedes");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [params, router]);

  // --- DETECTOR DE "CUALQUIER TECLA" PARA CONTINUAR ---
  useEffect(() => {
    if (!modalExitoBorrar && !modalErrorBorrar) return;

    const handleAnyKey = () => {
      if (modalExitoBorrar) {
        router.push('/huespedes');
      } else if (modalErrorBorrar) {
        setModalErrorBorrar(false);
      }
    };

    window.addEventListener('keydown', handleAnyKey);
    return () => window.removeEventListener('keydown', handleAnyKey);
  }, [modalExitoBorrar, modalErrorBorrar, router]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value, type } = e.target as HTMLInputElement;

    // Convertir a mayúsculas todo excepto email
    if (type === 'text' && name !== 'email') {
      value = value.toUpperCase();
    }

    setForm({ ...form, [name]: value });
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // --- LÓGICA MODIFICAR (VALIDACIONES ACTUALIZADAS) ---
  const handleModificar = async (forzar: boolean = false) => {
    const newErrors: any = {};
    let hayErrores = false;

    // 1. CAMPOS OBLIGATORIOS
    const obligatorios = [
      "apellido", "nombre", "fechaNacimiento", "tipoDocumento", 
      "numeroDocumento", "posicionIVA", "telefono", "nacionalidad", 
      "ocupacion", "calle", "numero", "codigoPostal", "localidad", 
      "provincia", "pais"
    ];

    obligatorios.forEach((campo) => {
      if (!form[campo] || String(form[campo]).trim() === "") {
        newErrors[campo] = "Campo Obligatorio";
        hayErrores = true;
      }
    });

    // 2. VALIDACIONES DE FORMATO

    // -- Solo letras (Nombre, Apellido, Ocupacion)
    const nombreRegex = /^[a-zA-Z\s\u00C0-\u00FF']+$/;
    if (form.nombre && !nombreRegex.test(form.nombre)) {
      newErrors.nombre = "Contiene caracteres inválidos";
      hayErrores = true;
    }
    if (form.apellido && !nombreRegex.test(form.apellido)) {
      newErrors.apellido = "Contiene caracteres inválidos";
      hayErrores = true;
    }
    // Ocupación solo alfabética
    if (form.ocupacion && !nombreRegex.test(form.ocupacion)) {
        newErrors.ocupacion = "Solo se permiten letras";
        hayErrores = true;
    }

    // -- Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Formato inválido (ej: usuario@dominio.com)";
      hayErrores = true;
    }

    // -- Fecha de Nacimiento 
    if (form.fechaNacimiento) {
        const fechaNac = new Date(form.fechaNacimiento);
        const hoy = new Date();
        const fechaMinima = new Date("1900-01-01"); 
        
        // Reset de horas para comparar solo fechas
        hoy.setHours(0,0,0,0);

        if (isNaN(fechaNac.getTime())) {
             newErrors.fechaNacimiento = "Fecha inválida";
             hayErrores = true;
        } else if (fechaNac > hoy) {
             newErrors.fechaNacimiento = "La fecha no puede ser futura";
             hayErrores = true;
        } else if (fechaNac < fechaMinima) {
             newErrors.fechaNacimiento = "Fecha inválida (muy antigua)";
             hayErrores = true;
        }
    }

    // -- Tipo de Documento
    if (form.numeroDocumento) {
        if (form.tipoDocumento === "PASAPORTE") {
            if (!/^[a-zA-Z]{3}\d{6}$/.test(form.numeroDocumento)) {
                newErrors.numeroDocumento = "Debe tener 3 letras y 6 números (ej: AAA123456)";
                hayErrores = true;
            }
        } else if (form.tipoDocumento === "DNI") {
            if (!/^\d+$/.test(form.numeroDocumento)) {
                newErrors.numeroDocumento = "Debe contener solo números";
                hayErrores = true;
            } else if(form.numeroDocumento.length > 8 || form.numeroDocumento.length < 7){
              newErrors.numeroDocumento = "Debe tener entre 7 y 8 dígitos";
              hayErrores = true;
            }
        }
    }

    // -- Teléfono
    if (form.telefono) {
        // Validación básica de caracteres
        if (!/^[\d\s\-\+]+$/.test(form.telefono)) {
            newErrors.telefono = "Caracteres inválidos";
            hayErrores = true;
        } else {
            // VALIDACIÓN NUEVA: Debe tener números
            const soloNumeros = form.telefono.replace(/\D/g, "");
            if (soloNumeros.length === 0) {
                newErrors.telefono = "Número inválido (sin dígitos)";
                hayErrores = true;
            }
        }
    }

    // -- CUIT (VALIDACIÓN NUEVA: Forma XX-XXXXXXXX-X)
    if (form.cuit) {
        const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
        if (!cuitRegex.test(form.cuit)) {
            newErrors.cuit = "Formato requerido: XX-XXXXXXXX-X";
            hayErrores = true;
        } 
    }

    // -- Direcciones: Números Positivos y Longitud de Texto
    
    // Validación Número (Calle)
    if (form.numero) {
        if (isNaN(Number(form.numero))) {
            newErrors.numero = "Debe ser numérico";
            hayErrores = true;
        } else if (Number(form.numero) < 0) {
            newErrors.numero = "No puede ser negativo";
            hayErrores = true;
        }
    }

    // Validación Piso
    if (form.piso && String(form.piso).trim() !== "") {
        if (isNaN(Number(form.piso))) {
            newErrors.piso = "Debe ser numérico";
            hayErrores = true;
        } else if (Number(form.piso) < 0) { 
            newErrors.piso = "No puede ser negativo";
            hayErrores = true;
        }
    }

    if (form.codigoPostal) {
        if (form.codigoPostal.length < 4 || form.codigoPostal.length > 8) {
            newErrors.codigoPostal = "Longitud inválida";
            hayErrores = true;
        }
        // VALIDACIÓN NUEVA: No negativo
        if (!isNaN(Number(form.codigoPostal)) && Number(form.codigoPostal) < 0) {
            newErrors.codigoPostal = "No puede ser negativo";
            hayErrores = true;
        }
    }

    // Longitud mínima de 3 letras
    const camposTextoMin3 = ["nacionalidad", "calle", "departamento", "localidad", "provincia", "pais","ocupacion"];
    camposTextoMin3.forEach(campo => {
        if (form[campo] && form[campo].trim().length < 3) {
            newErrors[campo] = "Mínimo 3 caracteres";
            hayErrores = true;
        }
    });

    setErrors(newErrors);

    if (hayErrores) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setProcesando(true);
    try {
      const payload = {
        id: form.id,
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
          pais: form.pais
        }
      };

      if (forzar) {
        await modificarHuespedForzado(payload);
        setModalCuidadoDuplicado(false);
      } else {
        await modificarHuesped(payload);
      }
      
      setModalExitoModificar(true);

    } catch (err: any) {
      if (!forzar && err.message && err.message.includes("CUIDADO")) {
          setModalCuidadoDuplicado(true);
      } else {
          alert("Error: " + err.message);
      }
    } finally {
      setProcesando(false);
    }
  };

  const handleCancelar = () => setModalConfirmarCancelar(true);

  const iniciarBorrado = async () => {
    try {
      const check = await verificarHuespedAlojado(form.id);
      if (check.seHaAlojado) setModalErrorBorrar(true);
      else setModalConfirmarBorrar(true);
    } catch (err) { alert("Error al verificar historial."); }
  };

  const confirmarBorrado = async () => {
    setModalConfirmarBorrar(false);
    setProcesando(true);
    try {
      await darBajaHuesped(String(params?.tipo), String(params?.nro));
      setModalExitoBorrar(true);
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setProcesando(false);
    }
  };
  
  useEffect(() => {
    if (!modalErrorBorrar) return;

    const handleKeyUp = (e: KeyboardEvent) => {
       e.preventDefault();
       e.stopPropagation();
       setModalErrorBorrar(false);
    };
    
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [modalErrorBorrar]);

  if (cargando) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-500">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900 relative">
      
      <div className="max-w-5xl mx-auto">
        {/* HEADER / BACK BUTTON */}
        <div className="w-full mb-8 flex items-center justify-between">
             <Link href="/huespedes" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <ArrowLeft size={20} />
                </div>
                <span>Volver al Listado</span>
             </Link>
             
             <button onClick={handleCancelar} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                <X size={20}/>
             </button>
        </div>

        {/* TÍTULO */}
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Modificar Huésped</h1>
            <p className="text-gray-500 text-sm mt-1">Actualice la información del cliente o realice una baja.</p>
        </div>

        {/* FORMULARIO CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 mb-10">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="mb-10">
             <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-bold text-gray-900">Datos Personales</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} error={errors.apellido} required />
                <InputField label="Nombre/s" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} required />
                <InputField label="Fecha de nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} error={errors.fechaNacimiento} required />

                <SelectField label="Tipo de Documento" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} error={errors.tipoDocumento} required 
                  options={[
                    {value:"DNI", label:"DNI"}, 
                    {value:"LE", label:"LE"},
                    {value:"LC", label:"LC"},
                    {value:"PASAPORTE", label:"PASAPORTE"},
                    {value:"OTRO", label:"OTRO"}
                  ]} 
                />
                
                <InputField label="Documento" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} error={errors.numeroDocumento} required 
                  inputRef={documentoRef} 
                />
                
                <InputField label="CUIT" name="cuit" value={form.cuit} onChange={handleChange} error={errors.cuit} />

                <SelectField label="Posición frente al IVA" name="posicionIVA" value={form.posicionIVA} onChange={handleChange} error={errors.posicionIVA} required
                  options={[
                    {value:"CONSUMIDOR_FINAL", label:"Consumidor Final"},
                    {value:"RESPONSABLE_INSCRIPTO", label:"Responsable Inscripto"},
                    {value:"MONOTRIBUTO", label:"Monotributo"}
                  ]} />
                
                <InputField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} error={errors.telefono} required />
                <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />

                <InputField label="Nacionalidad" name="nacionalidad" value={form.nacionalidad} onChange={handleChange} error={errors.nacionalidad} required />
                <InputField label="Ocupación" name="ocupacion" value={form.ocupacion} onChange={handleChange} error={errors.ocupacion} required />
             </div>
          </div>

          {/* SECCIÓN 2: DIRECCIÓN */}
          <div>
             <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-bold text-gray-900">Domicilio</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-4"><InputField label="Calle" name="calle" value={form.calle} onChange={handleChange} error={errors.calle} required /></div>
                <div className="md:col-span-2"><InputField label="Número" name="numero" value={form.numero} onChange={handleChange} error={errors.numero} required /></div>
                
                <div className="md:col-span-2"><InputField label="Departamento" name="departamento" value={form.departamento} onChange={handleChange} error={errors.departamento} /></div>
                <div className="md:col-span-2"><InputField label="Piso" name="piso" value={form.piso} onChange={handleChange} error={errors.piso} /></div>
                <div className="md:col-span-2"><InputField label="Código postal" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} error={errors.codigoPostal} required /></div>
                
                <div className="md:col-span-2"><InputField label="Localidad" name="localidad" value={form.localidad} onChange={handleChange} error={errors.localidad} required /></div>
                <div className="md:col-span-2"><InputField label="Provincia" name="provincia" value={form.provincia} onChange={handleChange} error={errors.provincia} required /></div>
                <div className="md:col-span-2"><InputField label="País" name="pais" value={form.pais} onChange={handleChange} error={errors.pais} required /></div>
             </div>
          </div>

          {/* ACCIONES FOOTER */}
          <div className="flex flex-col md:flex-row justify-end items-center gap-4 mt-12 pt-8 border-t border-gray-100">
             <button onClick={iniciarBorrado} disabled={procesando} className="text-rose-600 font-bold hover:bg-rose-50 px-6 py-3 rounded-xl transition-colors flex items-center gap-2 mr-auto">
                <Trash2 size={18}/> Eliminar Huésped
             </button>

             <button onClick={handleCancelar} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors w-full md:w-auto">
               Cancelar
             </button>
             <button onClick={() => handleModificar(false)} disabled={procesando} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all w-full md:w-auto flex items-center justify-center gap-2">
               {procesando ? "Guardando..." : <><Save size={18}/> Guardar Cambios</>}
             </button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2025 Hotel Premier - Sistema de Gestión</p>
          <p className="text-xs mt-1 opacity-70">Diseño de Sistemas - TP Final</p>
        </footer>
      </div>

      {/* --- MODALES (Estilo Moderno) --- */}
      
      {/* Modal Cuidado Duplicado */}
      {modalCuidadoDuplicado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[480px] text-center border-t-8 border-amber-400 relative">
            <button onClick={() => setModalCuidadoDuplicado(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Conflicto Detectado!</h3>
            <p className="text-gray-500 mb-8 text-sm">El tipo y número de documento ya existen en el sistema. ¿Desea sobrescribir los datos?</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => { 
                  setModalCuidadoDuplicado(false); 
                  setTimeout(() => documentoRef.current?.focus(), 100); 
                }} 
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
              >
                Corregir
              </button>
              <button onClick={() => handleModificar(true)} className="flex-1 py-3 bg-amber-400 text-amber-900 rounded-xl font-bold hover:bg-amber-500">
                Sobrescribir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Éxito Modificar */}
      {modalExitoModificar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in zoom-in duration-200">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-[400px] text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Operación Exitosa!</h3>
            <p className="text-gray-500 mb-8">Los datos han sido actualizados correctamente.</p>
            <button onClick={() => router.push('/huespedes')} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg">
                Continuar
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmar Cancelar */}
      {modalConfirmarCancelar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[400px] text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Cancelar edición?</h3>
            <p className="text-gray-500 mb-8 text-sm">Se perderán todos los cambios no guardados.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarCancelar(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                Seguir Editando
              </button>
              <button onClick={() => router.push('/huespedes')} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black">
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Borrar */}
      {modalConfirmarBorrar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[500px] text-center border-t-8 border-rose-500">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Eliminar Huésped?</h3>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-8 text-sm text-rose-800">
                <p>Se eliminará permanentemente a:</p>
                <p className="font-bold text-lg mt-1">{form.apellido}, {form.nombre}</p>
                <p className="font-mono mt-1">{form.tipoDocumento} {form.numeroDocumento}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarBorrar(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmarBorrado} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Error Borrar */}
      {modalErrorBorrar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[450px] text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se puede eliminar</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                El huésped tiene historial de alojamiento en el hotel y no puede ser borrado por integridad de datos.
            </p>
            <button onClick={() => setModalErrorBorrar(false)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">
                Entendido
            </button>
            <p className="text-xs text-gray-400 mt-4 animate-pulse">Presione cualquier tecla para continuar...</p>
          </div>
        </div>
      )}

      {/* Modal Éxito Borrar */}
      {modalExitoBorrar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in zoom-in duration-200">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-[450px] text-center">
            <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Huésped Eliminado</h3>
            <p className="text-gray-500 mb-8">Los datos han sido removidos del sistema correctamente.</p>
            <button onClick={() => router.push('/huespedes')} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black">
                Volver al listado
            </button>
            <p className="text-xs text-gray-400 mt-4 animate-pulse">Presione cualquier tecla para continuar...</p>
          </div>
        </div>
      )}
    </div>
  );
}