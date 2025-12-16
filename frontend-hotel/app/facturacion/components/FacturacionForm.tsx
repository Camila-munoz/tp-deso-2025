"use client";

import { useState } from 'react';
import {
  DatosFacturacion,
  Huesped,
  ItemFacturable,
  FacturaGenerada,
  ResponsableData,
  ApiResponse
} from '../types/facturacion';
import ModalMensaje from '../../../components/habitaciones/ModalMensaje';
import { 
  FileText, UserCheck, List, Check, ArrowRight, ArrowLeft, 
  CreditCard, User, AlertCircle, Loader2, Printer 
} from 'lucide-react';

const FacturacionComponent = () => {
  const [paso, setPaso] = useState<number>(1);
  const [datos, setDatos] = useState<DatosFacturacion>({});
  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemFacturable[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // ESTADO PARA EL MODAL DE ÉXITO
  const [modalExito, setModalExito] = useState<{show: boolean, factura?: FacturaGenerada}>({
    show: false
  });

  // Paso 1: Validar habitación y hora
  const validarDatosIniciales = async () => {
    setCargando(true);
    setError('');
    
    try {
      if (!datos.numeroHabitacion || !datos.horaSalida) {
        setError('Por favor complete todos los campos');
        return;
      }
      
      const response = await fetch('http://localhost:8080/api/facturacion/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroHabitacion: datos.numeroHabitacion,
          horaSalida: datos.horaSalida
        })
      });
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setDatos({...datos, ...result.data});
        setPaso(2);
      } else {
        setError(result.error || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };
  
  // Paso 2: Seleccionar responsable
  const seleccionarResponsable = async (idHuesped?: number, cuitTercero?: string | null) => {
    setCargando(true);
    setError('');
    
    try {
      const requestData: any = {};
      if (idHuesped) {
        requestData.idHuesped = idHuesped;
      }
      if (cuitTercero) {
        requestData.cuitTercero = cuitTercero;
      }
      
      const response = await fetch('http://localhost:8080/api/facturacion/validar-responsable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        const responsableData = result.data as ResponsableData;
        setDatos(prev => ({...prev, responsable: responsableData}));
        
        // Obtener items facturables
        if (datos.estadia && datos.horaSalida) {
          await obtenerItemsFacturables(
            datos.estadia.id,
            datos.horaSalida,
            responsableData.tipo,
            responsableData.posicionIVA
          );
        }
        
        setPaso(3);
      } else if (result.needsCU03) {
        setError('Necesita dar de alta al responsable primero (CU03)');
      } else {
        setError(result.error || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };
  
  // Paso 3: Obtener items facturables
  const obtenerItemsFacturables = async (
    estadiaId: number, 
    horaSalida: string, 
    tipoResponsable?: string, 
    posicionIVA?: string
  ) => {
    try {
      let url = `http://localhost:8080/api/facturacion/items/${estadiaId}?horaSalida=${encodeURIComponent(horaSalida)}`;
      
      if (tipoResponsable) {
        url += `&tipoResponsable=${tipoResponsable}`;
      }
      if (posicionIVA) {
        url += `&posicionIVA=${encodeURIComponent(posicionIVA || '')}`;
      }
      
      const response = await fetch(url);
      const result: ApiResponse<{items: ItemFacturable[]}> = await response.json();
      
      if (result.success && result.data) {
        setItemsSeleccionados(result.data.items);
        setDatos(prev => ({...prev, ...result.data}));
      } else {
        setError(result.error || 'Error al obtener items facturables');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    }
  };
  
  // Paso 4: Generar factura
  const generarFactura = async () => {
    setCargando(true);
    setError('');
    
    try {
      if (!datos.estadia || !datos.responsable) {
        setError('Faltan datos necesarios');
        return;
      }
      
      const itemsParaFacturar = itemsSeleccionados.filter(item => item.seleccionado);
      
      if (itemsParaFacturar.length === 0) {
        setError('Debe seleccionar al menos un ítem para facturar');
        return;
      }
      
      const requestData = {
        estadiaId: datos.estadia.id,
        responsableId: datos.responsable.responsable.id,
        itemsSeleccionados: itemsParaFacturar,
        horaSalida: datos.horaSalida
      };
      
      const response = await fetch('http://localhost:8080/api/facturacion/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const result: ApiResponse<{factura: FacturaGenerada}> = await response.json();
      const facturaGenerada = result.data?.factura || (result.data as unknown as FacturaGenerada);

      if (result.success && facturaGenerada) {
        setModalExito({
          show: true,
          factura: facturaGenerada
        });
      } else {
        setError(result.error || 'Error al generar la factura');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // MANEJADOR PARA CERRAR EL MODAL DE ÉXITO
  const handleCerrarModalExito = () => {
    if (modalExito.factura) {
      mostrarFactura(modalExito.factura, datos.responsable);
    }
    
    setModalExito({ show: false });
    setPaso(1);
    setDatos({});
    setItemsSeleccionados([]);
  };

  // Función para mostrar factura con DISEÑO DE IMPRESIÓN MEJORADO
  const mostrarFactura = (factura: FacturaGenerada, infoResponsable: ResponsableData | undefined) => {
    let nombreCliente = "CONSUMIDOR FINAL";
    let documentoCliente = "Sin identificar";
    let domicilioCliente = "Santa Fe, Argentina";
    let condicionIVA = infoResponsable?.posicionIVA || "Consumidor Final";

    if (infoResponsable) {
      if (infoResponsable.tipo === 'FISICA') {
        nombreCliente = infoResponsable.nombreCompleto || 'Huésped';
        if (infoResponsable.cuit) {
          documentoCliente = `CUIT: ${infoResponsable.cuit}`;
        } else if (infoResponsable.huesped) {
          documentoCliente = `${infoResponsable.huesped.tipoDocumento}: ${infoResponsable.huesped.numeroDocumento}`;
        }
        if (infoResponsable.huesped?.direccion) {
            const dir = infoResponsable.huesped.direccion;
            domicilioCliente = `${dir.calle || ''} ${dir.numero || ''}, ${dir.localidad || ''}`.trim();
        }
      } else if (infoResponsable.tipo === 'JURIDICA') {
        nombreCliente = infoResponsable.razonSocial || 'Empresa';
        documentoCliente = `CUIT: ${infoResponsable.cuit}`;
        // @ts-ignore
        const dir = infoResponsable.responsable?.direccion; 
        if (dir) {
            domicilioCliente = `${dir.calle || ''} ${dir.numero || ''}, ${dir.localidad || ''}`.trim();
        }
      }
    }

    const esFacturaA = factura.tipo === 'A';
    const total = factura.monto;
    const subtotal = esFacturaA ? total / 1.21 : total;
    const iva = esFacturaA ? total - subtotal : 0;

    const facturaWindow = window.open('', '_blank');
    if (facturaWindow) {
      facturaWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Factura ${factura.tipo} - ${factura.numero}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6; color: #111827; }
            .factura-container { background: white; max-width: 800px; margin: 0 auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 0; overflow: hidden; }
            .header-top { display: flex; justify-content: space-between; padding: 40px; border-bottom: 2px solid #f3f4f6; position: relative; }
            .letter-box { position: absolute; top: 0; left: 50%; transform: translateX(-50%); background: white; border: 2px solid #111827; border-top: none; width: 64px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 0 0 8px 8px; }
            .letter { font-size: 28px; font-weight: 700; line-height: 1; }
            .code { font-size: 9px; font-weight: 600; color: #6b7280; margin-top: 2px; }
            .company-name { font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0 0 8px 0; letter-spacing: -0.5px; }
            .company-details p { margin: 4px 0; font-size: 12px; color: #4b5563; }
            .invoice-title { font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 12px; text-align: right; letter-spacing: -1px; }
            .invoice-details p { margin: 4px 0; font-size: 13px; text-align: right; color: #374151; }
            .invoice-details strong { font-weight: 600; color: #111827; }
            
            .client-section { padding: 30px 40px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .client-group { margin-bottom: 5px; }
            .client-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 2px; }
            .client-value { font-size: 14px; font-weight: 600; color: #111827; }
            
            table { width: 100%; border-collapse: collapse; margin: 0; }
            th { background-color: #f3f4f6; color: #4b5563; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 12px 40px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            td { padding: 16px 40px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
            .col-monto { text-align: right; font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; font-weight: 600; }
            
            .totals-section { padding: 30px 40px; display: flex; justify-content: flex-end; background-color: #fff; }
            .totals-box { width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; color: #4b5563; font-size: 14px; }
            .total-final { font-size: 20px; font-weight: 800; color: #111827; border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 15px; }
            
            .footer { text-align: center; padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
            
            .no-print { text-align: center; margin-top: 30px; }
            .btn-print { background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); transition: all 0.2s; }
            .btn-print:hover { background: #4338ca; transform: translateY(-1px); }
            
            @media print { 
              .no-print { display: none; } 
              .factura-container { box-shadow: none; border: none; } 
              body { background: white; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="factura-container">
            <div class="header-top">
              <div class="letter-box">
                <span class="letter">${factura.tipo}</span>
                <span class="code">COD. 0${factura.tipo === 'A' ? '1' : '6'}</span>
              </div>
              
              <div style="width: 50%">
                <h1 class="company-name">HOTEL PREMIER</h1>
                <div class="company-details">
                  <p><strong>Razón Social:</strong> Hotel Premier S.A.</p>
                  <p>Bv. Gálvez 1234, Santa Fe</p>
                  <p>Resp. Inscripto</p>
                </div>
              </div>
              
              <div style="width: 50%">
                <div class="invoice-title">FACTURA</div>
                <div class="invoice-details">
                  <p>N° Comp.: <strong>0001-${factura.numero.toString().padStart(8, '0')}</strong></p>
                  <p>Fecha: <strong>${new Date(factura.fecha).toLocaleDateString()}</strong></p>
                  <p>CUIT: 30-77777777-1</p>
                </div>
              </div>
            </div>
            
            <div class="client-section">
              <div>
                <div class="client-group">
                    <span class="client-label">Cliente</span>
                    <span class="client-value">${nombreCliente}</span>
                </div>
                <div class="client-group" style="margin-top: 15px;">
                    <span class="client-label">Domicilio</span>
                    <span class="client-value">${domicilioCliente || '-'}</span>
                </div>
              </div>
              <div>
                <div class="client-group">
                    <span class="client-label">Documento</span>
                    <span class="client-value">${documentoCliente}</span>
                </div>
                <div class="client-group" style="margin-top: 15px;">
                    <span class="client-label">Condición IVA</span>
                    <span class="client-value">${condicionIVA}</span>
                </div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th class="col-monto">Importe</th>
                </tr>
              </thead>
              <tbody>
                ${factura.items?.map(item => `
                  <tr>
                    <td>${item.descripcion}</td>
                    <td class="col-monto">$${item.monto.toFixed(2)}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
            
            <div class="totals-section">
              <div class="totals-box">
                ${esFacturaA ? `
                  <div class="total-row">
                    <span>Importe Neto Gravado</span>
                    <span>$${subtotal.toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span>IVA 21%</span>
                    <span>$${iva.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="total-row total-final">
                  <span>TOTAL</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>Gracias por elegir Hotel Premier</p>
              <p style="margin-top: 5px;">Comprobante generado electrónicamente</p>
            </div>
          </div>
          
          <div class="no-print">
            <button onclick="window.print()" class="btn-print">🖨️ Imprimir Comprobante</button>
          </div>
        </body>
        </html>
      `);
      facturaWindow.document.close();
    }
  };
  
  // Toggle selección de item
  const toggleItem = (index: number) => {
    const nuevosItems = [...itemsSeleccionados];
    nuevosItems[index].seleccionado = !nuevosItems[index].seleccionado;
    setItemsSeleccionados(nuevosItems);
  };
  
  // COMPONENTE DE PASOS (Visual)
  const PasoIndicador = ({ num, label, icon: Icon }: any) => (
    <div className={`flex items-center gap-2 ${paso >= num ? 'text-indigo-600' : 'text-gray-400'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${paso >= num ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
            <Icon size={18} strokeWidth={paso >= num ? 2.5 : 2} />
        </div>
        <span className={`text-sm font-medium hidden md:block ${paso >= num ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
        {num < 3 && <div className="w-12 h-[2px] bg-gray-200 mx-2 hidden md:block" />}
    </div>
  );
  
  // Renderizar paso actual
  const renderizarPaso = () => {
    if (cargando) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-medium text-lg">Procesando información...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
             <p className="font-bold">Ha ocurrido un error</p>
             <p>{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-800 font-bold">✕</button>
        </div>
      );
    }
    
    switch (paso) {
      case 1:
        return (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Datos de la Estadía</h3>
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block tracking-wide">
                  Número de Habitación
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-800"
                  placeholder="Ej: 101"
                  value={datos.numeroHabitacion || ''}
                  onChange={(e) => setDatos({...datos, numeroHabitacion: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block tracking-wide">
                  Fecha y Hora de Salida
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-800"
                  value={datos.horaSalida || ''}
                  onChange={(e) => setDatos({...datos, horaSalida: e.target.value})}
                />
              </div>
              
              <button
                onClick={validarDatosIniciales}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex justify-center gap-2 items-center"
                disabled={cargando}
              >
                {cargando ? <Loader2 className="animate-spin"/> : <Check size={18}/>}
                {cargando ? 'Validando...' : 'Validar y Continuar'}
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="text-indigo-600"/> Seleccionar Responsable
                </h3>
                
                {datos.huespedes && datos.huespedes.length > 0 ? (
                  <div className="space-y-3">
                    {datos.huespedes.map((huesped: Huesped, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <User size={20}/>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{huesped.apellido}, {huesped.nombre}</p>
                                <p className="text-sm text-gray-500 font-medium">
                                {huesped.tipoDocumento}: {huesped.numeroDocumento}
                                </p>
                            </div>
                        </div>
                        <button
                          onClick={() => seleccionarResponsable(huesped.id)}
                          className="bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-md shadow-emerald-100 transition-all"
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">No se encontraron huéspedes registrados en esta habitación.</p>}
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">O facturar a un tercero (Empresa/Otro)</h4>
              <div className="flex gap-3">
                  <div className="relative flex-1">
                    <CreditCard className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="CUIT (Ej: 30-12345678-9)"
                        value={datos.cuitTercero || ''}
                        onChange={(e) => setDatos({...datos, cuitTercero: e.target.value})}
                    />
                  </div>
                  <button
                    onClick={() => seleccionarResponsable(undefined, datos.cuitTercero)}
                    className="bg-gray-900 text-white py-2 px-6 rounded-xl font-medium hover:bg-black transition-all shadow-lg"
                  >
                    Validar
                  </button>
              </div>
            </div>
            
            <button onClick={() => setPaso(1)} className="text-gray-400 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
              <ArrowLeft size={18}/> Volver atrás
            </button>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <List className="text-indigo-600"/> Items a Facturar
                </h3>
                <div className="text-right">
                    <span className="block text-xs text-gray-500 uppercase font-bold tracking-wide">Total Estimado</span>
                    <span className="text-3xl font-bold text-indigo-600">${datos.total?.toFixed(2) || '0.00'}</span>
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-xs text-gray-400 font-medium">TIPO:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${datos.tipoFactura === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {datos.tipoFactura || 'B'}
                        </span>
                    </div>
                </div>
             </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Monto</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Incluir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsSeleccionados.map((item: ItemFacturable, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                          item.tipo === 'ESTADIA' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{item.descripcion}</td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">${item.monto.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.seleccionado}
                          onChange={() => toggleItem(index)}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer accent-indigo-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {datos.tipoFactura === 'A' && (
               <div className="flex justify-end gap-6 text-sm text-gray-500 px-4">
                   <span>Neto: <strong>${datos.neto?.toFixed(2)}</strong></span>
                   <span>IVA (21%): <strong>${datos.iva?.toFixed(2)}</strong></span>
               </div>
            )}
            
            <div className="flex justify-between items-center pt-6">
              <button onClick={() => setPaso(2)} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
                ← Volver
              </button>
              <button
                onClick={generarFactura}
                className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Printer size={18}/> Generar Factura
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 relative">
      {/* COMPONENTE MODAL - Renderizado condicionalmente */}
      <ModalMensaje
        isOpen={modalExito.show}
        titulo="¡Factura Generada!"
        mensaje={`La factura ha sido generada correctamente y está lista para imprimir.`}
        tipo="EXITO"
        onClose={handleCerrarModalExito}
      />

      {/* HEADER DE PASOS */}
      <div className="flex justify-center mb-10">
        <PasoIndicador num={1} label="Validación" icon={FileText} />
        <PasoIndicador num={2} label="Responsable" icon={UserCheck} />
        <PasoIndicador num={3} label="Items" icon={List} />
      </div>
      
      {renderizarPaso()}
    </div>
  );
};

export default FacturacionComponent;