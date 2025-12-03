"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones, crearReserva } from "@/services/api";
import Grilla from "@/components/habitaciones/Grilla";
import Link from "next/link";

export default function ReservasPage() {
  // --- ESTADOS DE FECHA ---
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [fechaDesde, setFechaDesde] = useState(formatDate(today));
  const [fechaHasta, setFechaHasta] = useState(formatDate(nextWeek));
  
  // --- DATOS ---
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);

  // --- ESTADOS DE SELECCIÓN MULTIPLE (CARRITO) ---
  const [clickInicio, setClickInicio] = useState<{ idHab: number; fechaIso: string; index: number } | null>(null);
  const [carrito, setCarrito] = useState<any[]>([]); // <-- ¡Aquí guardamos todas las selecciones!

  // --- WIZARD (PASOS) ---
  const [paso, setPaso] = useState<"NONE" | "RESUMEN" | "DATOS" | "EXITO">("NONE");
  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "", email: "" });

  // 1. Carga Inicial
  useEffect(() => {
    getHabitaciones().then(res => {
      setHabitaciones(res.sort((a:any, b:any) => parseInt(a.numero) - parseInt(b.numero)));
    }).catch(console.error);
  }, []);

  // 2. Buscar Disponibilidad
  const handleBuscar = async () => {
    if (fechaDesde > fechaHasta) return alert("La fecha 'Hasta' debe ser mayor.");
    setCargando(true);
    try {
      const res = await getEstadoHabitaciones(fechaDesde, fechaHasta);
      if(res.success) {
        const mapa: Record<string, string> = {};
        res.data.forEach((i:any) => mapa[`${i.idHabitacion}_${i.fecha}`] = i.estado);
        setEstados(mapa);
        setBusquedaRealizada(true);
        setClickInicio(null);
        setCarrito([]); // Limpiamos carrito al buscar de nuevo
      }
    } catch(e) { alert("Error de conexión."); } finally { setCargando(false); }
  };

  // --- LÓGICA DE SELECCIÓN (2 CLICKS -> CARRITO) ---
  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    const key = `${hab.id}_${fechaIso}`;
    const estado = estados[key] || "LIBRE";

    // 1. Validación Inmediata
    if (estado !== "LIBRE") {
        setClickInicio(null);
        return alert("La habitación no está disponible en esa fecha.");
    }

    if (!clickInicio) {
        // PRIMER CLIC: Inicio
        setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso });
    } else {
        // SEGUNDO CLIC: Fin
        if (clickInicio.idHab !== hab.id) { 
            setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso }); // Cambio de fila = reinicio
            return; 
        }
        
        // Calcular Rango
        const d1 = new Date(clickInicio.fechaIso);
        const d2 = new Date(fechaIso);
        const inicio = d1 < d2 ? clickInicio.fechaIso : fechaIso;
        const fin = d1 < d2 ? fechaIso : clickInicio.fechaIso;

        // Validar que no pise ocupados
        let fechaIter = new Date(inicio);
        const fechaFinObj = new Date(fin);
        while(fechaIter <= fechaFinObj) {
            const isoIter = fechaIter.toISOString().split('T')[0];
            const keyIter = `${hab.id}_${isoIter}`;
            if ((estados[keyIter] || "LIBRE") !== "LIBRE") {
                setClickInicio(null);
                return alert("El rango seleccionado pisa fechas ocupadas.");
            }
            fechaIter.setDate(fechaIter.getDate() + 1);
        }

        // AGREGAR AL CARRITO
        const diasTotal = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / 86400000) + 1;
        
        // Verificar si ya existe en el carrito para no duplicar
        const yaExiste = carrito.some(item => item.idHab === hab.id && item.inicio === inicio);
        if(!yaExiste) {
            setCarrito([...carrito, { 
                idHab: hab.id, 
                numero: hab.numero, 
                tipo: hab.tipo?.descripcion || "Estándar",
                inicio, 
                fin, 
                dias: diasTotal 
            }]);
        }

        setClickInicio(null); // Listo para la siguiente selección
    }
  };

  // --- SUBMIT FINAL ---
  const handleSubmit = async () => {
    if(!form.apellido || !form.nombre || !form.telefono) return alert("Complete los campos obligatorios.");
    if(carrito.length === 0) return alert("No hay habitaciones seleccionadas.");

    try {
        // Convertimos el carrito al formato que espera el backend (Lista de detalles)
        const detalles = carrito.map(item => ({
            idHabitacion: item.idHab,
            fechaEntrada: item.inicio,
            fechaSalida: item.fin
        }));

        await crearReserva({
            detalles: detalles, // <--- Lista de rangos distintos
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
            email: form.email
        });
        
        setPaso("EXITO");
        handleBuscar(); // Refrescar grilla de fondo
    } catch(e:any) { alert(e.message); }
  };

  // Helper días
  const getDias = () => { 
    const [y, m, d] = fechaDesde.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const diff = Math.ceil((new Date(fechaHasta).getTime() - new Date(fechaDesde).getTime())/86400000);
    const dias = [];
    for(let i=0; i<=diff; i++){
        const d = new Date(start); d.setDate(d.getDate()+i);
        const iso = d.toISOString().split('T')[0];
        const label = `${d.getDate()}/${d.getMonth()+1}`;
        dias.push({label, iso, index:i});
    }
    return dias;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans relative flex flex-col items-center">
      
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-gray-500 hover:text-red-800 font-bold flex items-center gap-1"><span>⬅</span> MENÚ</Link>
      </div>

      <h1 className="text-4xl text-center text-red-900 font-bold mb-8 font-serif tracking-widest border-b-2 border-red-200 pb-4 px-10 mt-2">
        RESERVAR HABITACIÓN
      </h1>

      {/* BARRA DE FILTROS */}
      <div className="bg-white px-10 py-6 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row items-end gap-8 mb-8">
        <div className="flex flex-col">
            <label className="font-bold text-gray-600 text-sm mb-1 uppercase">Desde</label>
            <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="border-2 p-2 rounded-lg text-gray-700"/>
        </div>
        <div className="flex flex-col">
            <label className="font-bold text-gray-600 text-sm mb-1 uppercase">Hasta</label>
            <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="border-2 p-2 rounded-lg text-gray-700"/>
        </div>
        <button onClick={handleBuscar} disabled={cargando} className="bg-red-800 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-red-900 shadow-md disabled:opacity-50">
            {cargando ? "CARGANDO..." : "BUSCAR"}
        </button>
      </div>

      {/* GRILLA */}
      {busquedaRealizada && (
         <div className="w-full max-w-[95%] bg-white shadow-xl border border-gray-300 rounded-lg overflow-hidden mb-20">
            <Grilla 
                habitaciones={habitaciones} 
                estados={estados} 
                dias={getDias()} 
                onCellClick={handleCellClick} 
                seleccionInicio={clickInicio} 
                carrito={carrito} // <--- Pasamos la lista para que se pinten
            />
         </div>
      )}

      {/* BARRA FLOTANTE DEL CARRITO (Aparece si hay selecciones) */}
      {carrito.length > 0 && paso === "NONE" && (
        <div className="fixed bottom-6 right-6 animate-bounce">
            <button onClick={()=>setPaso("RESUMEN")} className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-green-700 flex items-center gap-2 text-lg">
                <span>🛒 Confirmar Selección ({carrito.length})</span>
            </button>
        </div>
      )}

      {/* --- MODAL 1: RESUMEN (TABLA DE CARRITO) --- */}
      {paso === "RESUMEN" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-0 shadow-2xl w-[800px] rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-blue-900 font-serif">RESUMEN DE RESERVA</h2>
                    <button onClick={()=>setPaso("NONE")} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
                </div>
                
                <div className="p-6 max-h-[400px] overflow-y-auto">
                    <table className="w-full text-center text-sm border-collapse">
                        <thead className="bg-gray-100 text-gray-600 text-xs uppercase sticky top-0">
                            <tr>
                                <th className="p-3 border-b">Habitación</th>
                                <th className="p-3 border-b">Ingreso (12:00)</th>
                                <th className="p-3 border-b">Egreso (10:00)</th>
                                <th className="p-3 border-b">Días</th>
                                <th className="p-3 border-b"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {carrito.map((item, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-bold text-gray-700">
                                        <span className="text-lg">{item.numero}</span>
                                        <br/><span className="text-xs text-gray-400 font-normal uppercase">{item.tipo}</span>
                                    </td>
                                    <td className="p-3 text-gray-600">{item.inicio}</td>
                                    <td className="p-3 text-gray-600">{item.fin}</td>
                                    <td className="p-3 font-bold text-blue-600">{item.dias}</td>
                                    <td className="p-3">
                                        <button onClick={()=>setCarrito(carrito.filter((_,i)=>i!==idx))} className="text-red-400 hover:text-red-600 font-bold text-lg" title="Quitar">✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {carrito.length === 0 && <p className="text-center text-gray-400 py-4">No hay habitaciones seleccionadas.</p>}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
                    <button onClick={()=>setPaso("NONE")} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded">
                        + AGREGAR MÁS
                    </button>
                    <button onClick={()=>setPaso("DATOS")} disabled={carrito.length===0} className="bg-[#d4e157] text-yellow-900 px-8 py-2 rounded font-bold shadow hover:bg-yellow-300 disabled:opacity-50">
                        CONTINUAR
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 2: DATOS --- */}
      {paso === "DATOS" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-white w-[500px] shadow-2xl rounded-lg border-t-8 border-yellow-400 overflow-hidden">
                <div className="bg-yellow-50 p-4 border-b border-yellow-100 text-center">
                    <h2 className="text-xl font-serif font-bold text-yellow-900">Datos del Titular</h2>
                    <p className="text-xs text-yellow-700 mt-1">Se aplicarán a las {carrito.length} habitaciones seleccionadas</p>
                </div>
                <div className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="APELLIDO *" className="border-2 p-3 rounded uppercase w-full outline-none focus:border-yellow-400" onChange={e=>setForm({...form, apellido: e.target.value.toUpperCase()})}/>
                        <input placeholder="NOMBRE *" className="border-2 p-3 rounded uppercase w-full outline-none focus:border-yellow-400" onChange={e=>setForm({...form, nombre: e.target.value.toUpperCase()})}/>
                    </div>
                    <input placeholder="TELÉFONO *" className="border-2 p-3 rounded w-full outline-none focus:border-yellow-400" onChange={e=>setForm({...form, telefono: e.target.value})}/>
                    <input placeholder="EMAIL (OPCIONAL)" className="border-2 p-3 rounded w-full outline-none focus:border-yellow-400 uppercase" onChange={e=>setForm({...form, email: e.target.value.toUpperCase()})}/>
                    
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <button onClick={()=>setPaso("RESUMEN")} className="text-gray-500 hover:underline text-sm">Volver</button>
                        <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-green-700">FINALIZAR</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 3: EXITO --- */}
      {paso === "EXITO" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in">
             <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-[400px] border-b-8 border-green-500">
                 <div className="text-6xl mb-4">✅</div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva Exitosa!</h2>
                 <p className="text-gray-500 mb-6">Se han registrado correctamente {carrito.length} habitaciones.</p>
                 <button onClick={()=>{setPaso("NONE"); setCarrito([]); setForm({nombre:"",apellido:"",telefono:"",email:""})}} 
                    className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-blue-700 w-full">
                    ACEPTAR
                 </button>
             </div>
        </div>
      )}
    </div>
  );
}