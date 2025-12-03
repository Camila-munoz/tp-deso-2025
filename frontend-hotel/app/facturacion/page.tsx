"use client";
import { useState, useRef } from "react"; // 1. Importamos useRef
import { useRouter } from "next/navigation";
import { previsualizarFactura, confirmarFactura, buscarOcupantes } from "@/services/api";
// --- TIPOS ---
interface ItemFactura {
  concepto: string;
  monto: number;
  seleccionado: boolean;
}

interface HuespedMock {
  id: number;
  apellido: string;
  nombre: string;
  tipoDoc: string;
  documento: string;
}

export default function FacturacionPage() {
  const router = useRouter();

  // --- ESTADOS DE NAVEGACIÓN Y UI ---
  const [paso, setPaso] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  // Estado para el Modal de Errores (Req 3.A.1)
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [mensajesError, setMensajesError] = useState<string[]>([]);

  // --- DATOS DEL FORMULARIO ---
  const [numHabitacion, setNumHabitacion] = useState("");
  const [horaSalida, setHoraSalida] = useState("");

  // --- REFERENCIAS PARA EL FOCO (Req 3.A.2) ---
  const habitacionRef = useRef<HTMLInputElement>(null);
  const horaRef = useRef<HTMLInputElement>(null);

  // --- DATOS DE NEGOCIO ---
  const [huespedes, setHuespedes] = useState<HuespedMock[]>([]);
  const [responsableId, setResponsableId] = useState<number | null>(null);
  const [modalTerceroOpen, setModalTerceroOpen] = useState(false);
  const [cuitTercero, setCuitTercero] = useState("");
  const [esTercero, setEsTercero] = useState(false);
  const [nombreResponsableDisplay, setNombreResponsableDisplay] = useState("");
  const [itemsFactura, setItemsFactura] = useState<ItemFactura[]>([]);
  const [tipoFactura, setTipoFactura] = useState("B");
  const [facturaFinal, setFacturaFinal] = useState<any>(null);

  // ----------------------------------------------------------------
  // LÓGICA DE VALIDACIÓN (REQ 3.A)
  // ----------------------------------------------------------------
  const handleBuscarHabitacion = async () => {
    const erroresDetectados: string[] = [];
    let focoAsignado = false; // Para saber si ya decidimos a quién dar foco

    // 1. Validar Número de Habitación
    if (!numHabitacion.trim()) {
      erroresDetectados.push("- El número de habitación es obligatorio.");
      if (!focoAsignado) {
        focoAsignado = true;
      }
    }
    // 2. Validar Hora de Salida
    if (!horaSalida.trim()) {
      erroresDetectados.push("- La hora de salida es obligatoria.");
      if (!focoAsignado) {

      }
    } else {
      const regexHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!regexHora.test(horaSalida)) {
        erroresDetectados.push("- La hora debe tener formato HH:mm (ej: 10:00).");
      }
    }
    if (erroresDetectados.length > 0) {
      setMensajesError(erroresDetectados);
      setErrorModalOpen(true);
      return; // Cortamos el flujo, volvemos al punto 3 del flujo principal (estado inicial)
    }

    // 2. Validación contra el BACKEND (Habitación Ocupada)
    setLoading(true);
    try {
      // LLAMADA REAL A LA API
      const ocupantes = await buscarOcupantes(numHabitacion);
      
      // Si llegamos aquí, la API respondió OK (200)
      setHuespedes(ocupantes); // Asignamos los datos reales a la tabla
      setPaso(2); // Avanzamos a la siguiente pantalla

    } catch (error: any) {
      // CAPTURA DE ERRORES DEL BACKEND (404, 500, etc)
      // Aquí entra si la habitación no está ocupada (404)
      setMensajesError([`- ${error.message}`]);
      setErrorModalOpen(true);
      
      // Si el error fue de la habitación, aseguramos que el foco vaya ahí
      if (!focoAsignado) {
          // Asumimos que el error de API se refiere a la habitación
          // (Podrías refinar esto si tu API devuelve códigos de error específicos para campos)
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el modal de error y poner el foco (Req 3.A.2)
  const cerrarModalError = () => {
    setErrorModalOpen(false);
    
    // Lógica para poner foco en el PRIMER campo incorrecto
    // Verificamos de nuevo las condiciones simples para saber cuál falló primero
    if (!numHabitacion.trim() || numHabitacion === "100") {
      habitacionRef.current?.focus();
    } else if (!horaSalida.trim()) {
      horaRef.current?.focus();
    }
  };


  // ... (El resto de funciones: handleSeleccionarHuesped, handleAbrirTercero, etc. se mantienen igual)
  const handleSeleccionarHuesped = (id: number, nombreCompleto: string) => {
    setResponsableId(id);
    setNombreResponsableDisplay(nombreCompleto);
    setEsTercero(false);
    setCuitTercero(""); 
  };

  const handleAbrirTercero = () => {
    setModalTerceroOpen(true);
    setResponsableId(null); 
  };

  const confirmarTercero = () => {
    if (!cuitTercero) return alert("Ingrese un CUIT");
    setEsTercero(true);
    setNombreResponsableDisplay(`RAZÓN SOCIAL (CUIT: ${cuitTercero})`);
    setModalTerceroOpen(false);
    setResponsableId(9999); 
    irAResumen(); 
  };

  const irAResumen = async () => {
    if (!esTercero && !responsableId) return alert("Seleccione un responsable de pago");
    setLoading(true);
    try {
      const data = await previsualizarFactura(Number(numHabitacion));
      const itemsConToggle = data.items.map((it: any) => ({
        ...it,
        seleccionado: true 
      }));
      setItemsFactura(itemsConToggle);
      setTipoFactura(data.tipoFactura || "B");
      if (!esTercero) {
        setNombreResponsableDisplay(data.huesped || nombreResponsableDisplay);
      }
      setPaso(3);
    } catch (error: any) {
      alert("Error al obtener datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const nuevosItems = [...itemsFactura];
    nuevosItems[index].seleccionado = !nuevosItems[index].seleccionado;
    setItemsFactura(nuevosItems);
  };

  const calcularTotales = () => {
    return itemsFactura
      .filter(i => i.seleccionado)
      .reduce((acc, curr) => acc + curr.monto, 0);
  };

  const handleConfirmarFactura = async () => {
    const totalCalculado = calcularTotales();
    if (totalCalculado <= 0) return alert("El monto debe ser mayor a 0");

    setLoading(true);
    const payload = {
      monto: totalCalculado,
      tipo: tipoFactura,
      estado: "PENDIENTE",
      estadia: { id: Number(numHabitacion) }, 
      responsable: { id: responsableId } 
    };

    try {
      const res = await confirmarFactura(payload);
      if (res.success) {
        setFacturaFinal({
          id: res.id,
          fecha: new Date().toLocaleDateString(),
          tipo: tipoFactura,
          responsable: nombreResponsableDisplay,
          cuit: esTercero ? cuitTercero : "Consumidor Final",
          direccion: esTercero ? "Domicilio Fiscal Desconocido" : "Sin dirección",
          condicionIva: esTercero ? "Resp. Inscripto" : "Consumidor Final",
          items: itemsFactura.filter(i => i.seleccionado),
          total: totalCalculado
        });
        setPaso(4);
      }
    } catch (error: any) {
      alert("Error al generar factura: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E0E0E0] p-4 font-serif text-black relative flex flex-col items-center">
      
      {/* Botón Salir */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-4 right-4 w-8 h-8 bg-red-500 border-2 border-gray-800 text-white font-bold flex items-center justify-center rounded-full shadow hover:bg-red-600 z-10"
      >
        X
      </button>

      {/* ICONO USUARIO */}
      <div className="absolute top-4 left-4">
         <div className="w-12 h-12 bg-gray-700 rounded-full border-2 border-gray-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
         </div>
      </div>

      {/* --- CONTENEDOR PRINCIPAL --- */}
      {paso < 4 && (
        <div className="w-full max-w-4xl mt-16">
          
          {/* CAJA AZUL CLARO (INPUTS) */}
          <div className="bg-[#ADD8E6] border border-gray-500 p-8 shadow-md relative">
            
            <div className="flex flex-col gap-4 items-center">
              
              {/* INPUT HABITACIÓN */}
              <div className="flex items-center w-full justify-center gap-4">
                <label className="font-bold text-xl min-w-[220px] text-right">Número de habitación:</label>
                <div className="relative">
                    <input 
                      ref={habitacionRef} // Asignamos la Referencia
                      type="number"
                      value={numHabitacion}
                      onChange={(e) => setNumHabitacion(e.target.value)}
                      placeholder="Ingrese número"
                      className="border border-gray-400 p-1 w-64 shadow-inner text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     {/* Flechas simuladas */}
                    <div className="absolute right-0 top-0 h-full w-6 bg-gray-200 border-l border-gray-400 flex flex-col pointer-events-none">
                        <div className="h-1/2 border-b border-gray-400 flex items-center justify-center text-[8px]">▲</div>
                        <div className="h-1/2 flex items-center justify-center text-[8px]">▼</div>
                    </div>
                </div>
              </div>

              {/* INPUT HORA */}
              <div className="flex items-center w-full justify-center gap-4">
                <label className="font-bold text-xl min-w-[220px] text-right">Hora de salida:</label>
                <input 
                  ref={horaRef} // Asignamos la Referencia
                  type="text"
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                  placeholder="HH:mm"
                  className="border border-gray-400 p-1 w-64 shadow-inner text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button 
                onClick={handleBuscarHabitacion}
                className="mt-2 bg-[#AEEEEE] border-2 border-gray-600 px-6 py-1 font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none hover:bg-[#97e9e9]"
              >
                Confirmar
              </button>
            </div>
          </div>

          {/* LISTA DE HUÉSPEDES (Paso 2) */}
          {paso >= 2 && (
             // ... (El bloque de lista de huéspedes permanece idéntico al anterior)
             <div className="mt-8">
              <h2 className="text-xl font-bold mb-1 text-black font-serif drop-shadow-sm">Lista de Huéspedes</h2>
              <div className="border border-gray-600 bg-white">
                <table className="w-full text-center text-sm">
                  <thead className="bg-[#BFEFFF] border-b border-gray-600 font-bold">
                    <tr>
                      <th className="p-2 border-r border-gray-600">Apellido</th>
                      <th className="p-2 border-r border-gray-600">Nombre</th>
                      <th className="p-2 border-r border-gray-600">Tipo de Documento</th>
                      <th className="p-2 border-r border-gray-600">Documento</th>
                      <th className="p-2">Responsable de pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {huespedes.map((h) => (
                      <tr key={h.id} className="border-b border-gray-400 h-10 hover:bg-blue-50">
                        <td className="border-r border-gray-400">{h.apellido}</td>
                        <td className="border-r border-gray-400">{h.nombre}</td>
                        <td className="border-r border-gray-400">{h.tipoDoc}</td>
                        <td className="border-r border-gray-400">{h.documento}</td>
                        <td className="flex justify-center items-center h-10">
                          <input 
                            type="radio" 
                            name="responsable"
                            checked={responsableId === h.id}
                            onChange={() => handleSeleccionarHuesped(h.id, `${h.apellido} ${h.nombre}`)}
                            className="w-4 h-4 accent-black cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div onClick={handleAbrirTercero} className="bg-[#00BFFF] border-t border-gray-600 py-2 text-center font-bold cursor-pointer hover:bg-[#00aadd] border-b border-gray-600">
                  Facturar a nombre de un tercero
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button onClick={irAResumen} disabled={loading} className="bg-[#AEEEEE] border-2 border-gray-600 px-12 py-1 font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none hover:bg-[#97e9e9]">
                  {loading ? "Cargando..." : "Aceptar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL DE ERRORES DE VALIDACIÓN (3.A.1) --- */}
      {errorModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
           <div className="bg-red-100 border-2 border-red-600 p-6 w-[400px] shadow-2xl relative">
              
              <div className="flex items-center gap-3 mb-4 text-red-700">
                 {/* Icono de Alerta */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <h3 className="font-bold text-xl uppercase">Atención</h3>
              </div>
              
              {/* Lista de Errores Explicitos */}
              <div className="mb-6 space-y-1 text-red-900 font-medium text-sm">
                 {mensajesError.map((msg, idx) => (
                    <p key={idx}>{msg}</p>
                 ))}
              </div>

              <div className="flex justify-end">
                 <button 
                    onClick={cerrarModalError} // Al cerrar se ejecuta 3.A.2 (foco)
                    className="bg-red-600 text-white border border-black px-4 py-1 font-bold shadow-md hover:bg-red-700"
                 >
                    ACEPTAR
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODALES RESTANTES (Tercero, Resumen, Factura Final) --- */}
      {/* Se mantienen igual que en la versión anterior... */}
      {modalTerceroOpen && (
         // Copiar el modal de tercero de la respuesta anterior
         <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-[#E0E0E0] p-6 border border-gray-500 shadow-[4px_4px_10px_rgba(0,0,0,0.3)] w-[500px] h-[250px] flex flex-col justify-center items-center relative">
            <div className="flex items-center w-full justify-center gap-2 mb-8">
              <label className="font-bold text-3xl font-serif">CUIT:</label>
              <input className="border border-gray-500 p-1 w-64 text-sm" placeholder="Ingrese CUIT" value={cuitTercero} onChange={(e) => setCuitTercero(e.target.value)} />
            </div>
            <button onClick={confirmarTercero} className="bg-[#D4E875] border border-gray-600 px-8 py-1 font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:bg-[#cbe065] uppercase text-sm">Aceptar</button>
          </div>
        </div>
      )}

      {/* Modal Resumen (Mismo que antes) */}
      {paso === 3 && (
         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#F0F0F0] border border-gray-400 shadow-2xl w-[600px] relative font-serif">
            <div className="absolute -top-4 left-6"><h2 className="text-3xl font-black text-[#87CEEB] tracking-wide" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>Resumen:</h2></div>
            <div className="pt-10 pb-6 px-8">
              <h3 className="text-center font-bold text-xl mb-6">{nombreResponsableDisplay}</h3>
              <div className="border border-gray-500 bg-white">
                {itemsFactura.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center h-10 px-4 border-b border-gray-300 last:border-0">
                    <span className="text-sm font-medium">{item.concepto}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-sm w-20 text-right font-bold">$ {item.monto.toLocaleString('es-AR', {minimumFractionDigits: 0})}</span>
                      <div onClick={() => toggleItem(idx)} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.seleccionado ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${item.seleccionado ? 'left-5' : 'left-0.5'}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center h-10 px-4 bg-[#FFFACD] border-t border-gray-500">
                  <span className="text-sm font-bold">Total a pagar {tipoFactura === 'A' ? 'sin IVA' : ''}:</span>
                  <div className="flex items-center gap-6">
                    <span className="text-sm w-20 text-right font-bold">${calcularTotales().toLocaleString('es-AR', {minimumFractionDigits: 0})}</span>
                    <div className="w-10 h-5 opacity-0"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center h-10 px-4 border-t border-gray-500">
                  <span className="text-sm">Tipo de factura</span>
                  <div className="flex items-center gap-2">
                     <span className="text-gray-400 text-xs">Tipo</span>
                     <select value={tipoFactura} disabled className="border border-gray-400 bg-white text-sm py-0 h-6 w-12 text-center"><option value="A">A</option><option value="B">B</option></select>
                     <div className="w-10 h-5 bg-blue-500 rounded-full relative ml-2"><div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full"></div></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button onClick={handleConfirmarFactura} disabled={loading} className="bg-[#B0C4DE] border border-gray-700 px-8 py-1 font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:bg-[#a0b4ce] uppercase text-xs tracking-wider">{loading ? "Procesando..." : "ACEPTAR"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Factura Final (Mismo que antes) */}
      {paso === 4 && facturaFinal && (
        <div className="w-full h-full fixed inset-0 bg-gray-500/50 flex justify-center overflow-y-auto py-10 z-50">
          <div className="w-[800px] h-[900px] bg-white border border-gray-800 p-8 shadow-2xl relative">
            <div className="absolute -top-10 right-0"><button onClick={() => router.push('/')} className="bg-red-500 text-white p-2 rounded-full font-bold border-2 border-white shadow-lg">Cerrar</button></div>
            <div className="border border-black h-40 flex relative">
              <div className="w-1/2 p-4 border-r border-black flex flex-col justify-center">
                 <h1 className="text-2xl font-bold text-center uppercase mb-2">NOMBRE HOTEL</h1>
                 <div className="text-xs space-y-1"><p>Dirección</p><p>Ciudad, Provincia, País</p><p>Código Postal</p><p>Teléfono</p><p>E-mail</p></div>
              </div>
              <div className="absolute left-1/2 -ml-5 top-0 w-10 h-10 border-b border-x border-black bg-white flex flex-col items-center justify-center z-10"><span className="font-bold text-lg">{facturaFinal.tipo}</span><span className="text-[6px]">COD. NUM.</span></div>
              <div className="w-1/2 p-4 pl-8 flex flex-col justify-start">
                 <h2 className="text-xl font-bold mb-4">FACTURA</h2>
                 <div className="text-xs space-y-1"><p>Factura Número: <span className="font-bold ml-2">{String(facturaFinal.id).padStart(8, '0')}</span></p><p>Fecha de Emisión: <span className="ml-2">{facturaFinal.fecha}</span></p></div>
              </div>
            </div>
            <div className="border-x border-b border-black flex text-xs h-8 items-center px-2">
               <div className="w-1/2">Período Factura desde:</div><div className="w-1/2">Hasta: <span className="ml-20">Fecha de Vto. para el pago:</span></div>
            </div>
            <div className="border-x border-b border-black p-2 text-xs h-24 flex flex-col justify-center space-y-2">
               <div className="flex"><span className="w-24 font-bold">CUIT:</span><span>{facturaFinal.cuit}</span><span className="ml-auto w-24 font-bold">Apellido y Nombre / Razón Social:</span><span className="w-64">{facturaFinal.responsable}</span></div>
               <div className="flex"><span className="w-24 font-bold">Condición IVA:</span><span>{facturaFinal.condicionIva}</span></div>
               <div className="flex"><span className="w-24 font-bold">Dirección:</span><span>{facturaFinal.direccion}</span></div>
            </div>
            <div className="border-x border-b border-black min-h-[400px] flex flex-col">
               <div className="bg-gray-200 border-b border-black flex text-xs font-bold h-6 items-center text-center"><div className="w-1/2">Descripción</div><div className="w-1/6">Cantidad</div><div className="w-1/6">Precio Unit.</div><div className="w-1/6">Importe</div></div>
               <div className="flex-1 text-xs">
                  {facturaFinal.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex h-6 items-center px-2"><div className="w-1/2">{item.concepto}</div><div className="w-1/6 text-center">1</div><div className="w-1/6 text-right">{item.monto.toLocaleString('es-AR')}</div><div className="w-1/6 text-right">{item.monto.toLocaleString('es-AR')}</div></div>
                  ))}
               </div>
               <div className="border-t border-black text-xs">
                  <div className="flex h-6 items-center border-b border-gray-300"><div className="w-2/3"></div><div className="w-1/6 font-bold px-2">Subtotal: $</div><div className="w-1/6 text-right px-2">{facturaFinal.total.toLocaleString('es-AR')}</div></div>
                  <div className="flex h-8 items-center font-bold"><div className="w-2/3"></div><div className="w-1/6 px-2 text-sm">Importe Total: $</div><div className="w-1/6 text-right px-2 text-sm">{tipoFactura === 'A' ? (facturaFinal.total * 1.21).toLocaleString('es-AR') : facturaFinal.total.toLocaleString('es-AR')}</div></div>
               </div>
            </div>
            <div className="border-x border-b border-black p-2 h-24 mt-4 mb-4"><h3 className="text-sm font-bold uppercase">Observaciones:</h3></div>
          </div>
        </div>
      )}
    </div>
  );
}