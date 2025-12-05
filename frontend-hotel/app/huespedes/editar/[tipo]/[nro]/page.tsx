"use client";
import { useState, useEffect, useRef } from "react"; 
import { useRouter, useParams } from "next/navigation"; 
import { obtenerHuespedPorDocumento, modificarHuesped, modificarHuespedForzado, darBajaHuesped, verificarHuespedAlojado } from "@/services/api";

// --- 1. COMPONENTES HELPERS (DEFINIDOS AFUERA) ---

const InputField = ({ label, name, value, onChange, error, type = "text", disabled = false, required = false, inputRef }: any) => (
  <div>
    <label className={`block font-bold mb-1 ${error ? "text-red-600" : "text-gray-900"}`}>
      {label} {required && <span className="text-red-600">(*)</span>}
    </label>
    <input 
      ref={inputRef} 
      type={type}
      name={name}
      value={value || ""} 
      onChange={onChange} 
      disabled={disabled}
      className={`w-full border p-1.5 rounded outline-none transition-colors 
        ${type === 'text' ? 'uppercase' : ''} 
        ${error ? 'border-red-500 border-2 bg-white text-gray-900' : 'border-gray-500 focus:border-blue-500'}
        ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'}
      `} 
    />
    {error && <p className="text-red-500 text-sm mt-1 font-bold">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, error, options, disabled = false, required = false }: any) => (
  <div>
    <label className={`block font-bold mb-1 ${error ? "text-red-600" : "text-gray-900"}`}>
      {label} {required && <span className="text-red-600">(*)</span>}
    </label>
    <select 
      name={name}
      value={value || ""} 
      onChange={onChange} 
      disabled={disabled}
      className={`w-full border p-1.5 rounded outline-none 
        ${error ? 'border-red-500 border-2 bg-white' : 'border-gray-500 focus:border-blue-500'}
        ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'}
      `}
    >
      <option value="">Seleccionar</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1 font-bold">{error}</p>}
  </div>
);

// --- 2. COMPONENTE PRINCIPAL ---

export default function ModificarHuespedPage() {
  const router = useRouter();
  const params = useParams();
  
  // REFERENCIA PARA EL FOCO
  const documentoRef = useRef<HTMLInputElement>(null);

  // Estados de Modales
  const [modalConfirmarBorrar, setModalConfirmarBorrar] = useState(false);
  const [modalExitoBorrar, setModalExitoBorrar] = useState(false);
  const [modalErrorBorrar, setModalErrorBorrar] = useState(false);
  const [modalExitoModificar, setModalExitoModificar] = useState(false);
  const [modalConfirmarCancelar, setModalConfirmarCancelar] = useState(false);
  const [modalCuidadoDuplicado, setModalCuidadoDuplicado] = useState(false);

  // Estado del formulario
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

  // --- NUEVO: DETECTOR DE "CUALQUIER TECLA" PARA CONTINUAR ---
  useEffect(() => {
    // Si no están los modales finales de borrado, no hacemos nada
    if (!modalExitoBorrar && !modalErrorBorrar) return;

    const handleAnyKey = () => {
      if (modalExitoBorrar) {
        // Caso Éxito: Volver al menú
        router.push('/huespedes');
      } else if (modalErrorBorrar) {
        // Caso Error: Cerrar modal para ver los datos
        setModalErrorBorrar(false);
      }
    };

    // Agregar el escuchador al objeto window
    window.addEventListener('keydown', handleAnyKey);
    
    // Limpiar al desmontar para evitar duplicados
    return () => window.removeEventListener('keydown', handleAnyKey);
  }, [modalExitoBorrar, modalErrorBorrar, router]);


  // Manejador de cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value, type } = e.target as HTMLInputElement;

    if (type === 'text' && name !== 'email') {
      value = value.toUpperCase();
    }

    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // --- LÓGICA MODIFICAR ---
  const handleModificar = async (forzar: boolean = false) => {
    const newErrors: any = {};
    let hayErrores = false;

    const regexSoloTexto = /^[A-ZÁÉÍÓÚÜÑ\s.]+$/;
    const regexSoloNumeros = /^[0-9]+$/;
    const regexTelefono = /^[0-9-]+$/;

    const camposSoloTexto = ["nombre", "apellido", "nacionalidad", "ocupacion", "calle", "localidad", "provincia", "pais"];
    const camposSoloNumeros = ["numero", "piso", "codigoPostal", "numeroDocumento", "cuit"];
    
    const validarCampo = (campo: string, tipo: 'texto' | 'numero' | 'telefono' | 'cualquiera') => {
      const valor = form[campo] ? String(form[campo]).trim() : "";
      const esObligatorio = ["apellido", "nombre", "fechaNacimiento", "tipoDocumento", "numeroDocumento", "posicionIVA", "telefono", "nacionalidad", "ocupacion", "calle", "numero", "codigoPostal", "localidad", "provincia", "pais"].includes(campo);

      if (esObligatorio && !valor) {
        newErrors[campo] = "Campo Obligatorio";
        hayErrores = true;
        return;
      }

      if (valor) {
        if (tipo === 'texto' && !regexSoloTexto.test(valor)) {
          newErrors[campo] = "Formato inválido";
          hayErrores = true;
        } else if (tipo === 'numero' && !regexSoloNumeros.test(valor)) {
          newErrors[campo] = "Formato inválido";
          hayErrores = true;
        } else if (tipo === 'telefono' && !regexTelefono.test(valor)) {
          newErrors[campo] = "Formato inválido";
          hayErrores = true;
        }
      }
    };

    camposSoloTexto.forEach(c => validarCampo(c, 'texto'));
    camposSoloNumeros.forEach(c => validarCampo(c, 'numero'));
    validarCampo('telefono', 'telefono');
    validarCampo('tipoDocumento', 'cualquiera');
    validarCampo('posicionIVA', 'cualquiera');
    
    if (form.fechaNacimiento) {
        const fecha = new Date(form.fechaNacimiento);
        if (isNaN(fecha.getTime())) {
            newErrors.fechaNacimiento = "Fecha inválida";
            hayErrores = true;
        }
    } else {
        newErrors.fechaNacimiento = "Campo Obligatorio";
        hayErrores = true;
    }

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
  // --- DETECTOR DE TECLADO CORREGIDO ---
  useEffect(() => {
    if (!modalErrorBorrar) return;

    const handleKeyUp = (e: KeyboardEvent) => {
       // 1. Detenemos que el Enter active cosas de fondo (como el submit del formulario)
       e.preventDefault();
       e.stopPropagation();

       // 2. Cerramos el modal
       setModalErrorBorrar(false);
    };

    // USAMOS 'keyup' EN LUGAR DE 'keydown'
    window.addEventListener('keyup', handleKeyUp);
    
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [modalErrorBorrar]);
  if (cargando) return <div className="p-10 text-center text-xl font-bold">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-gray-200 p-4 font-sans text-gray-900 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="ml-4 mt-2">
           <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center text-white border-2 border-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4 1 1 1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
             </svg>
           </div>
        </div>
        <h1 className="text-4xl font-bold text-red-700 drop-shadow-sm mt-4 tracking-wider" style={{ fontFamily: 'serif' }}>
          MODIFICAR HUÉSPED
        </h1>
        <button onClick={() => router.push('/huespedes')} className="mr-4 mt-2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-black hover:bg-red-700 shadow-md text-xl">X</button>
      </div>

      {/* FORMULARIO */}
      <div className="max-w-6xl mx-auto bg-gray-200 px-10 pb-10">
        
        <h2 className="text-2xl font-bold text-sky-400 mb-4" style={{ textShadow: '1px 1px 0 #fff' }}>Datos Personales</h2>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
            <InputField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} error={errors.apellido} required />
            <InputField label="Nombre/s" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} required />
            <InputField label="Fecha de nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} error={errors.fechaNacimiento} required />

            <SelectField label="Tipo de Documento" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} error={errors.tipoDocumento} required 
              options={[{value:"DNI", label:"DNI"}, {value:"PASAPORTE", label:"PASAPORTE"}]} />
            
            {/* INPUT CON REFERENCIA */}
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
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />

            <InputField label="Nacionalidad" name="nacionalidad" value={form.nacionalidad} onChange={handleChange} error={errors.nacionalidad} required />
            <InputField label="Ocupación" name="ocupacion" value={form.ocupacion} onChange={handleChange} error={errors.ocupacion} required />
            <div></div>
        </div>

        <h2 className="text-2xl font-bold text-sky-400 mb-4 border-b-2 border-sky-400 inline-block w-full" style={{ textShadow: '1px 1px 0 #fff' }}>Dirección</h2>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1"><InputField label="Calle" name="calle" value={form.calle} onChange={handleChange} error={errors.calle} required /></div>
          <div><InputField label="Número" name="numero" value={form.numero} onChange={handleChange} error={errors.numero} required /></div>
          <div><InputField label="Departamento" name="departamento" value={form.departamento} onChange={handleChange} /></div>
          <div><InputField label="Piso" name="piso" value={form.piso} onChange={handleChange} error={errors.piso} /></div>
          <div><InputField label="Código postal" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} error={errors.codigoPostal} required /></div>
          <div><InputField label="Localidad" name="localidad" value={form.localidad} onChange={handleChange} error={errors.localidad} required /></div>
          <div><InputField label="Provincia" name="provincia" value={form.provincia} onChange={handleChange} error={errors.provincia} required /></div>
          <div><InputField label="País" name="pais" value={form.pais} onChange={handleChange} error={errors.pais} required /></div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-between mt-12 px-8">
          <button onClick={() => handleModificar(false)} disabled={procesando} className="bg-sky-300 border border-black px-16 py-2 font-bold shadow-md hover:bg-sky-400 active:translate-y-1 w-48">
            {procesando ? "Guardando..." : "Siguiente"}
          </button>
          <button onClick={handleCancelar} className="bg-sky-200 border border-black text-black px-16 py-2 font-bold shadow-md hover:bg-sky-300 active:translate-y-1 w-48">
            Cancelar
          </button>
          <button onClick={iniciarBorrado} disabled={procesando} className="bg-red-500 border border-black text-white px-16 py-2 font-bold shadow-md hover:bg-red-600 active:translate-y-1 w-48">
            Borrar
          </button>
        </div>
      </div>

      {/* --- MODALES --- */}
      {modalCuidadoDuplicado && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-b from-sky-200 to-gray-300 p-1 border-2 border-black rounded-lg shadow-2xl w-[500px] relative">
            <div className="bg-sky-200 border-b-2 border-black p-2 flex justify-between items-center rounded-t-lg">
                <span className="font-bold text-2xl px-2">Cuidado</span>
                <button onClick={() => setModalCuidadoDuplicado(false)} className="bg-red-500 text-white w-8 h-8 rounded-full border border-black font-bold flex items-center justify-center hover:bg-red-600">X</button>
            </div>
            <div className="p-8 flex flex-col items-center">
                <div className="mb-6 relative">
                    <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-yellow-300"></div>
                    <span className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-bold text-black">!</span>
                </div>
                <p className="text-center font-bold text-lg mb-8">¡CUIDADO! El tipo y número de documento ya existen en el sistema</p>
                <div className="flex gap-8 w-full justify-center">
                  <button onClick={() => handleModificar(true)} className="bg-green-600 text-black border-2 border-black px-6 py-2 font-bold text-lg shadow-md hover:bg-green-700">Aceptar</button>
                  <button 
                    onClick={() => { 
                      setModalCuidadoDuplicado(false); 
                      setTimeout(() => documentoRef.current?.focus(), 100); 
                    }} 
                    className="bg-yellow-300 text-black border-2 border-black px-6 py-2 font-bold text-lg shadow-md hover:bg-yellow-400"
                  >
                    Corregir
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {modalExitoModificar && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-b from-white to-gray-300 p-8 border border-gray-600 shadow-2xl w-[600px] text-center relative">
            <h3 className="font-serif font-bold text-2xl mb-8 leading-tight">La operación ha culminado con éxito</h3>
            <button onClick={() => router.push('/huespedes')} className="bg-sky-200 border border-black px-12 py-2 font-bold shadow hover:bg-sky-300">Continuar</button>
          </div>
        </div>
      )}

      {modalConfirmarCancelar && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-b from-sky-200 to-gray-300 p-6 rounded-lg border-2 border-black shadow-2xl w-[500px] relative">
            <div className="bg-sky-200 border-b-2 border-black p-2 -mx-6 -mt-6 rounded-t-lg flex justify-between items-center mb-6">
                <span className="font-bold text-xl px-4">Cuidado</span>
                <button onClick={() => setModalConfirmarCancelar(false)} className="bg-red-500 text-white w-8 h-8 rounded-full border border-black font-bold mr-2">X</button>
            </div>
            <div className="flex justify-center mb-4">
                <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-yellow-400 relative">
                    <span className="absolute -left-2 top-4 text-3xl font-bold text-black">!</span>
                </div>
            </div>
            <div className="text-center mb-8"><h3 className="font-bold text-lg mb-2">¿Desea cancelar la modificación?</h3></div>
            <div className="flex justify-around">
              <button onClick={() => router.push('/huespedes')} className="bg-green-600 text-black border-2 border-black px-8 py-2 font-bold shadow-md hover:bg-green-700">SI</button>
              <button onClick={() => setModalConfirmarCancelar(false)} className="bg-yellow-200 text-black border-2 border-black px-8 py-2 font-bold shadow-md hover:bg-yellow-300">NO</button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmarBorrar && (
        <div className="fixed inset-0 bg-gray-200 z-50 flex flex-col items-center justify-center font-serif text-gray-900">
          <div className="absolute top-6 right-6"><button onClick={() => setModalConfirmarBorrar(false)} className="w-10 h-10 bg-red-500 rounded-full text-white font-bold border-2 border-black">X</button></div>
          <div className="text-center mb-12"><h2 className="text-3xl font-bold max-w-2xl leading-relaxed">Los datos del huésped <span className="italic text-gray-600">{form.nombre} {form.apellido},</span><br/><span className="italic text-gray-600">{form.tipoDocumento} {form.numeroDocumento}</span><br/>serán eliminados del sistema</h2></div>
          <div className="flex gap-20"><button onClick={confirmarBorrado} className="bg-green-600 border border-black px-12 py-3 text-xl font-bold shadow-lg hover:bg-green-700">Eliminar</button><button onClick={() => setModalConfirmarBorrar(false)} className="bg-red-500 border border-black px-12 py-3 text-xl font-bold text-white shadow-lg hover:bg-red-600">Cancelar</button></div>
        </div>
      )}

      {modalErrorBorrar && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-b from-white to-gray-300 p-10 shadow-2xl border border-gray-500 w-[600px] text-center relative">
            <h3 className="font-serif font-bold text-xl mb-6">El huésped no puede ser eliminado pues se ha<br/>alojado en el Hotel en alguna oportunidad</h3>
            {/* AQUÍ ESTÁ EL CLICK NORMAL, PERO EL USEEFFECT ABAJO MANEJA EL TECLADO */}
            <button onClick={() => setModalErrorBorrar(false)} className="text-sky-600 font-bold hover:underline">Presione cualquier tecla para continuar</button>
          </div>
        </div>
      )}

      {modalExitoBorrar && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-b from-white to-gray-300 p-10 shadow-2xl border border-gray-500 w-[600px] text-center relative">
            <h3 className="font-serif font-bold text-xl mb-6">Los datos del huésped <span className="italic text-gray-600">{form.nombre} {form.apellido},</span><br/><span className="italic text-gray-600">{form.tipoDocumento} {form.numeroDocumento}</span><br/>han sido eliminados del sistema</h3>
            <button onClick={() => router.push('/huespedes')} className="text-sky-600 font-bold hover:underline">Presione cualquier tecla para continuar</button>
          </div>
        </div>
      )}
    </div>
  );
}