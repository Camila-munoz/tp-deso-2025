"use client";
import { useState, useEffect } from "react";
import { getHabitaciones, getEstadoHabitaciones, crearEstadia } from "@/services/api";
import Grilla from "@/components/habitaciones/Grilla";
import ModalConflicto from "@/components/habitaciones/ModalConflicto";
import ModalIntermedio from "@/components/habitaciones/ModalIntermedio";
import ModalCargaHuespedes from "@/components/habitaciones/ModalCargaHuespedes";
import ModalOpciones from "@/components/habitaciones/ModalOpciones";
import Link from "next/link";

export default function OcuparPage() {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [fechaDesde, setFechaDesde] = useState(today);
  const [fechaHasta, setFechaHasta] = useState(nextWeek);
  
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);

  // --- ESTADOS DEL PROCESO (CARRITO VISUAL) ---
  const [clickInicio, setClickInicio] = useState<any>(null);
  const [itemsPendientes, setItemsPendientes] = useState<any[]>([]); 
  
  // --- ESTADOS DE DATOS FINALES (MEMORIA) ---
  const [datosFinales, setDatosFinales] = useState<any[]>([]);

  // Control de Modales
  const [itemProcesando, setItemProcesando] = useState<any>(null);
  const [indiceProcesando, setIndiceProcesando] = useState(0);
  const [modal, setModal] = useState<"NONE" | "CONFLICTO" | "INTERMEDIO" | "CARGA" | "OPCIONES" | "EXITO">("NONE");
  
  // Nuevo estado para manejar los mensajes de error según la imagen
  const [errorModal, setErrorModal] = useState<{
    tipo: "CUIDADO" | "ERROR";
    titulo: string;
    mensaje: string;
    botones: string[];
    onAceptar?: () => void;
    onCorregir?: () => void;
    onOk?: () => void;
    onSi?: () => void;
    onNo?: () => void;
  } | null>(null);

  useEffect(() => {
    getHabitaciones().then(res => setHabitaciones(res.sort((a:any, b:any) => parseInt(a.numero)-parseInt(b.numero))));
  }, []);

  const handleBuscar = async () => {
    setCargando(true);
    try {
        const res = await getEstadoHabitaciones(fechaDesde, fechaHasta);
        if(res.success) {
            const mapa: any = {};
            res.data.forEach((i:any) => mapa[`${i.idHabitacion}_${i.fecha}`] = i.estado);
            setEstados(mapa);
            setBusquedaRealizada(true);
            setClickInicio(null); 
            setItemsPendientes([]); 
            setDatosFinales([]);
        }
    } catch(e) {
      console.error("Error al buscar disponibilidad:", e);
    } finally { 
        setCargando(false); 
    }
  };

  // --- FUNCIÓN PARA MOSTRAR MODAL DE ERROR SEGÚN LA IMAGEN ---
  const mostrarModalError = (
    tipo: "CUIDADO" | "ERROR", 
    titulo: string, 
    mensaje: string, 
    botones: string[], 
    callbacks?: { 
      onAceptar?: () => void, 
      onCorregir?: () => void,
      onOk?: () => void,
      onSi?: () => void,
      onNo?: () => void 
    }
  ) => {
    setErrorModal({
      tipo,
      titulo,
      mensaje,
      botones,
      onAceptar: callbacks?.onAceptar,
      onCorregir: callbacks?.onCorregir,
      onOk: callbacks?.onOk,
      onSi: callbacks?.onSi,
      onNo: callbacks?.onNo
    });
  };

  // --- 1. SELECCIÓN EN GRILLA (CARRITO) ---
  const handleCellClick = (hab: any, diaIndex: number, fechaIso: string) => {
    const key = `${hab.id}_${fechaIso}`;
    const estado = estados[key] || "LIBRE";

    // MODIFICADO: Mostrar modal de error según la imagen cuando está OCUPADO
    if (estado === "OCUPADO") {
      mostrarModalError(
        "ERROR",
        "Error",
        "La habitación está OCUPADA en la fecha seleccionada.",
        ["OK"],
        {
          onOk: () => setErrorModal(null)
        }
      );
      return;
    }

    // MODIFICADO: Mostrar modal de error según la imagen cuando está FUERA_DE_SERVICIO
    if (estado === "FUERA_DE_SERVICIO") {
      mostrarModalError(
        "ERROR",
        "Error",
        "La habitación está FUERA DE SERVICIO en la fecha seleccionada.",
        ["OK"],
        {
          onOk: () => setErrorModal(null)
        }
      );
      return;
    }

    // --- SELECCIÓN DE RANGO (EFECTO AZUL Y LUEGO ROJO) ---
    if (!clickInicio) {
        setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso });
    } else {
        if (clickInicio.idHab !== hab.id) { 
          setClickInicio({ idHab: hab.id, index: diaIndex, fechaIso }); 
          return; 
        }
        
        const d1 = new Date(clickInicio.fechaIso); 
        const d2 = new Date(fechaIso);
        const inicio = d1 < d2 ? clickInicio.fechaIso : fechaIso;
        const fin = d1 < d2 ? fechaIso : clickInicio.fechaIso;
        const dias = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / 86400000) + 1;

        // Validar ocupación en el medio
        let fIter = new Date(inicio);
        const fEnd = new Date(fin);
        let esReservada = false;
        let fechaConflicto = "";

        while(fIter <= fEnd) {
            const iso = fIter.toISOString().split('T')[0];
            const st = estados[`${hab.id}_${iso}`] || "LIBRE";
            
            // MODIFICADO: Mostrar modal de error si encuentra ocupación durante el rango
            if(st === "OCUPADO") { 
                setClickInicio(null); 
                mostrarModalError(
                  "ERROR",
                  "Error",
                  "El rango seleccionado incluye días en que la habitación está OCUPADA.",
                  ["OK"],
                  {
                    onOk: () => setErrorModal(null)
                  }
                );
                return; 
            }
            
            // MODIFICADO: Mostrar modal de error si encuentra fuera de servicio durante el rango
            if(st === "FUERA_DE_SERVICIO") { 
                setClickInicio(null); 
                mostrarModalError(
                  "ERROR",
                  "Error",
                  "El rango seleccionado incluye días en que la habitación está FUERA DE SERVICIO.",
                  ["OK"],
                  {
                    onOk: () => setErrorModal(null)
                  }
                );
                return; 
            }
            
            if(st === "RESERVADO") { 
                esReservada = true; 
                fechaConflicto = iso; 
            }
            fIter.setDate(fIter.getDate() + 1);
        }

        // Agregar a Pendientes (Esto pintará de ROJO visualmente)
        const nuevoItem = { 
            idHab: hab.id, 
            numero: hab.numero, 
            inicio, 
            fin, 
            dias, 
            estadoOriginal: esReservada ? "RESERVADA" : "LIBRE",
            fechaConflicto
        };
        setItemsPendientes([...itemsPendientes, nuevoItem]);
        setClickInicio(null);
    }
  };

  // --- 2. INICIAR PROCESO (Punto 3 del flujo) ---
  const iniciarProceso = () => {
      if (itemsPendientes.length === 0) return;
      procesarItem(0);
  };

  const procesarItem = (index: number) => {
      if (index >= itemsPendientes.length) {
          guardarTodoEnBD();
          return;
      }
      const item = itemsPendientes[index];
      setItemProcesando(item);
      setIndiceProcesando(index);

      // Si hay conflicto, mostramos modal. Si no, directo al cartel intermedio.
      if (item.estadoOriginal === "RESERVADA") {
          setModal("CONFLICTO");
      } else {
          setModal("INTERMEDIO");
      }
  };

  // --- HANDLERS ---
  const handleOcuparIgual = () => setModal("INTERMEDIO");
  
  const handleContinuarCarga = () => setModal("CARGA");

  const handleAceptarCarga = (titular: any, acompanantes: any[]) => {
      // Guardamos los datos EN MEMORIA
      const datoFinal = {
          idHabitacion: itemProcesando.idHab,
          idHuespedTitular: titular.id,
          idsAcompañantes: acompanantes.map(a => a.id),
          cantidadDias: itemProcesando.dias,
          idReserva: null 
      };
      setDatosFinales([...datosFinales, datoFinal]);
      setModal("OPCIONES");
  };

  const handleSeguirCargando = () => setModal("CARGA");
  
  const handleCargarOtra = () => {
      procesarItem(indiceProcesando + 1);
  };

  const handleSalir = () => {
      guardarTodoEnBD();
  };

  // --- GUARDADO REAL ---
  const guardarTodoEnBD = async () => {
      try {
          for (const datos of datosFinales) {
              await crearEstadia(datos);
          }
          setModal("EXITO");
          setItemsPendientes([]);
          setDatosFinales([]);
          handleBuscar();
      } catch(e: any) { 
        mostrarModalError(
          "ERROR",
          "Error",
          "Error al guardar: " + e.message,
          ["OK"],
          {
            onOk: () => setErrorModal(null)
          }
        );
      }
  };

  const getDias = () => { 
      const d = []; 
      const diff = Math.ceil((new Date(fechaHasta).getTime() - new Date(fechaDesde).getTime()) / 86400000);
      for(let i = 0; i <= diff; i++){
          const dt = new Date(new Date(fechaDesde).getTime() + i * 86400000);
          d.push({
            label: `${dt.getDate()}/${dt.getMonth() + 1}`,
            iso: dt.toISOString().split('T')[0],
            index: i
          });
      }
      return d;
  };

  // Función para manejar la acción del botón en el modal de error
  const handleErrorButtonClick = (buttonType: string) => {
    if (!errorModal) return;

    switch(buttonType) {
      case "ACEPTAR":
        if (errorModal.onAceptar) errorModal.onAceptar();
        break;
      case "CORREGIR":
        if (errorModal.onCorregir) errorModal.onCorregir();
        break;
      case "OK":
        if (errorModal.onOk) errorModal.onOk();
        else setErrorModal(null);
        break;
      case "SI":
        if (errorModal.onSi) errorModal.onSi();
        break;
      case "NO":
        if (errorModal.onNo) errorModal.onNo();
        break;
      default:
        setErrorModal(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative flex flex-col items-center">
       {/* Header */}
       <div className="absolute top-6 left-6">
         <Link href="/" className="text-gray-500 hover:text-red-800 font-bold flex items-center gap-1">
           <span>⬅</span> MENÚ
         </Link>
       </div>

       <h1 className="text-4xl text-center text-[#d32f2f] font-bold mb-8 font-serif drop-shadow-sm tracking-widest">
         OCUPAR HABITACIÓN (CU15)
       </h1>

       {/* Filtros */}
       <div className="bg-white px-10 py-6 rounded-xl shadow border flex items-end gap-8 mb-8">
         <div className="flex flex-col">
           <label className="font-bold text-sm mb-1">DESDE</label>
           <input 
             type="date" 
             value={fechaDesde} 
             onChange={e => setFechaDesde(e.target.value)} 
             className="border-2 p-2 rounded w-48"
           />
         </div>
         <div className="flex flex-col">
           <label className="font-bold text-sm mb-1">HASTA</label>
           <input 
             type="date" 
             value={fechaHasta} 
             onChange={e => setFechaHasta(e.target.value)} 
             className="border-2 p-2 rounded w-48"
           />
         </div>
         <button 
           onClick={handleBuscar} 
           disabled={cargando}
           className="bg-red-800 text-white px-8 py-2.5 rounded font-bold shadow hover:bg-red-900 disabled:opacity-50"
         >
           {cargando ? "CARGANDO..." : "BUSCAR"}
         </button>
       </div>

       {/* Grilla */}
       {busquedaRealizada && (
          <div className="w-full max-w-[95%] bg-white shadow-xl border rounded mb-10 relative">
             <Grilla 
                habitaciones={habitaciones} 
                estados={estados} 
                dias={getDias()} 
                onCellClick={handleCellClick} 
                seleccionInicio={clickInicio} 
                carrito={itemsPendientes.map(i => ({
                  idHab: i.idHab, 
                  inicio: i.inicio, 
                  fin: i.fin, 
                  colorForzado: "bg-red-600 text-white opacity-90"
                }))} 
             />
             
             {/* Botón para arrancar el flujo */}
             {itemsPendientes.length > 0 && modal === "NONE" && (
                <div className="fixed bottom-10 right-10 animate-bounce z-50">
                   <button 
                     onClick={iniciarProceso} 
                     className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl text-lg border-4 border-green-400 hover:bg-green-700 transition-colors"
                   >
                      INICIAR CHECK-IN ({itemsPendientes.length}) ➡
                   </button>
                </div>
             )}
          </div>
       )}

       {/* MODAL DE ERROR SEGÚN LA IMAGEN */}
       {errorModal && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
           <div className="bg-white p-0 shadow-2xl w-[400px] rounded-lg overflow-hidden border-4 border-gray-800">
             {/* Encabezado */}
             <div className={`p-4 ${errorModal.tipo === 'ERROR' ? 'bg-red-600' : 'bg-yellow-400'} text-white font-bold text-center text-xl`}>
               {errorModal.titulo}
             </div>
             
             {/* Cuerpo del mensaje */}
             <div className="p-8 text-center">
               <p className="text-gray-700 text-lg mb-8">{errorModal.mensaje}</p>
               
               {/* Botones */}
               <div className="flex justify-center gap-4">
                 {errorModal.botones.map((boton, index) => (
                   <button
                     key={index}
                     onClick={() => handleErrorButtonClick(boton)}
                     className={`px-8 py-2 rounded font-bold shadow-md transition-colors min-w-[100px] ${
                       boton === "ACEPTAR" || boton === "SI" 
                         ? 'bg-red-600 text-white hover:bg-red-700 border-2 border-red-800' 
                         : 'bg-gray-300 text-gray-800 hover:bg-gray-400 border-2 border-gray-400'
                     }`}
                   >
                     {boton}
                   </button>
                 ))}
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Modales existentes */}
       <ModalConflicto 
         isOpen={modal === "CONFLICTO"} 
         onClose={() => setModal("NONE")} 
         onOcuparIgual={handleOcuparIgual} 
         habitacionId={itemProcesando?.idHab} 
         habitacionNumero={itemProcesando?.numero} 
         fechaConsulta={itemProcesando?.fechaConflicto} 
       />
       
       <ModalIntermedio 
         isOpen={modal === "INTERMEDIO"} 
         onContinue={handleContinuarCarga} 
       />
       
       <ModalCargaHuespedes 
         isOpen={modal === "CARGA"} 
         habitacionNumero={itemProcesando?.numero} 
         onAceptar={handleAceptarCarga} 
       />
       
       <ModalOpciones 
         isOpen={modal === "OPCIONES"} 
         onSeguirCargando={handleSeguirCargando} 
         onCargarOtra={handleCargarOtra} 
         onSalir={handleSalir} 
       />
       
       {modal === "EXITO" && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
           <div className="bg-white p-10 rounded shadow-2xl text-center border-b-8 border-green-500 w-[400px]">
             <div className="text-5xl mb-4">✅</div>
             <h2 className="text-2xl font-bold mb-2">¡Check-in Exitoso!</h2>
             <p className="text-gray-600 mb-6">Se han ocupado {datosFinales.length} habitaciones correctamente.</p>
             <button 
               onClick={() => {
                 setModal("NONE");
                 setItemsPendientes([]);
                 setDatosFinales([]);
               }} 
               className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-blue-700 w-full"
             >
               CONTINUAR
             </button>
           </div>
         </div>
       )}

       {/* Estado de carga */}
       {cargando && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-lg shadow-lg">
             <div className="flex items-center gap-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
               <span className="text-lg font-semibold">Buscando disponibilidad...</span>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}