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
// IMPORTAMOS EL COMPONENTE DE MODAL
import ModalMensaje from '../../../components/habitaciones/ModalMensaje';

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
        horaSalida: datos.horaSalida // Importante: enviamos la hora confirmada
      };
      
      const response = await fetch('http://localhost:8080/api/facturacion/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const result: ApiResponse<{factura: FacturaGenerada}> = await response.json();
      const facturaGenerada = result.data?.factura || (result.data as unknown as FacturaGenerada);

      if (result.success && facturaGenerada) {
        // CAMBIO AQUÍ: En lugar de alert, activamos el modal
        setModalExito({
          show: true,
          factura: facturaGenerada
        });
        // Nota: El reinicio de datos se hace al cerrar el modal (handleCerrarModal)
        // para que no se pierda la info antes de imprimir.
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
      // 1. Mostrar la factura para imprimir
      mostrarFactura(modalExito.factura, datos.responsable);
    }
    
    // 2. Cerrar modal y reiniciar formulario
    setModalExito({ show: false });
    setPaso(1);
    setDatos({});
    setItemsSeleccionados([]);
  };

  // Función para mostrar factura con DISEÑO CORREGIDO Y NIVELADO
  const mostrarFactura = (factura: FacturaGenerada, infoResponsable: ResponsableData | undefined) => {
    // 1. Extraer datos reales del cliente
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
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
            
            body { 
              font-family: 'Roboto', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #f5f5f5; 
              color: #333; 
            }
            
            .factura-container { 
              background: white; 
              max-width: 800px; 
              margin: 0 auto; 
              border: 1px solid #ccc; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
              position: relative; 
            }

            /* --- HEADER NIVELADO --- */
            .header-top { 
              display: flex; 
              justify-content: space-between;
              align-items: flex-start; 
              border-bottom: 2px solid #000; 
              position: relative; 
              padding: 30px 40px 20px; 
              height: auto; 
              min-height: 140px;
            }
            
            .col-left { 
              width: 45%; 
              padding-right: 20px;
              box-sizing: border-box;
            }
            
            .col-right { 
              width: 45%; 
              padding-left: 20px;
              text-align: right; 
              box-sizing: border-box;
            }
            
            .letter-box { 
              position: absolute; 
              top: 0; 
              left: 50%; 
              transform: translateX(-50%); 
              background: white; 
              border: 2px solid black; 
              border-top: none; 
              width: 60px; 
              height: 50px; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              z-index: 10; 
            }
            .letter { font-size: 32px; line-height: 32px; }
            .code { font-size: 10px; }
            
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin: 0 0 10px 0; 
            }
            .company-details p { margin: 3px 0; font-size: 12px; color: #444; }
            
            .invoice-title { 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 15px; 
              color: #000;
              margin-top: 0; 
            }
            
            .invoice-details p { 
              margin: 4px 0; 
              font-size: 13px; 
              display: flex; 
              justify-content: flex-end; 
              gap: 10px;
            }
            
            .invoice-details strong {
                font-size: 14px;
            }
            
            .client-section { padding: 15px 40px; border-bottom: 1px solid #ccc; background-color: #f9f9f9; }
            .client-row { display: flex; margin-bottom: 5px; font-size: 13px; }
            .client-label { font-weight: bold; width: 120px; }
            .client-value { flex: 1; text-transform: uppercase; }
            
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
            th { background-color: #e0e0e0; border: 1px solid #ccc; padding: 10px; text-align: left; }
            td { border: 1px solid #ccc; padding: 8px 10px; }
            .col-monto { text-align: right; width: 120px; }
            
            .totals-section { display: flex; justify-content: flex-end; padding: 10px 40px 30px; }
            .totals-table { width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-final { font-weight: bold; font-size: 16px; border-top: 2px solid #333; margin-top: 5px; padding-top: 5px; }
            
            .footer { text-align: center; font-size: 11px; color: #777; padding: 20px; border-top: 1px solid #eee; }
            .no-print { text-align: center; margin-top: 20px; }
            .btn-print { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; }
            
            @media print { 
              .no-print { display: none; } 
              .factura-container { box-shadow: none; border: none; } 
              body { background: white; }
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
              
              <div class="col-left">
                <h1 class="company-name">HOTEL PREMIER</h1>
                <div class="company-details">
                  <p><strong>Razón Social:</strong> Hotel Premier S.A.</p>
                  <p><strong>Domicilio:</strong> Bv. Gálvez 1234, Santa Fe</p>
                  <p><strong>Condición IVA:</strong> Responsable Inscripto</p>
                </div>
              </div>
              
              <div class="col-right">
                <div class="invoice-title">FACTURA</div>
                <div class="invoice-details">
                  <p><span>N° Comp.:</span> <strong>0001-${factura.numero.toString().padStart(8, '0')}</strong></p>
                  <p><span>Fecha Emisión:</span> ${new Date(factura.fecha).toLocaleDateString()}</p>
                  <p><span>CUIT:</span> 30-77777777-1</p>
                  <p><span>Ingresos Brutos:</span> 30-77777777-1</p>
                </div>
              </div>
            </div>
            
            <div class="client-section">
              <div class="client-row">
                <span class="client-label">Cliente:</span>
                <span class="client-value"><strong>${nombreCliente}</strong></span>
              </div>
              <div class="client-row">
                <span class="client-label">Documento:</span>
                <span class="client-value">${documentoCliente}</span>
              </div>
              <div class="client-row">
                <span class="client-label">Condición IVA:</span>
                <span class="client-value">${condicionIVA}</span>
              </div>
              <div class="client-row">
                <span class="client-label">Domicilio:</span>
                <span class="client-value">${domicilioCliente || '-'}</span>
              </div>
              <div class="client-row">
                <span class="client-label">Habitación:</span>
                <span class="client-value">${factura.habitacion}</span>
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
              <div class="totals-table">
                ${esFacturaA ? `
                  <div class="total-row">
                    <span>Importe Neto Gravado:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span>IVA 21%:</span>
                    <span>$${iva.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="total-row total-final">
                  <span>Importe Total:</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>Gracias por elegir Hotel Premier</p>
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
  
  // Renderizar paso actual
  const renderizarPaso = () => {
    if (cargando) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Procesando...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Cerrar
          </button>
        </div>
      );
    }
    
    switch (paso) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Validar Datos de Facturación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Habitación
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 101"
                  value={datos.numeroHabitacion || ''}
                  onChange={(e) => setDatos({...datos, numeroHabitacion: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Salida
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={datos.horaSalida || ''}
                  onChange={(e) => setDatos({...datos, horaSalida: e.target.value})}
                />
              </div>
              
              <button
                onClick={validarDatosIniciales}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={cargando}
              >
                {cargando ? 'Validando...' : 'Validar Datos'}
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Seleccionar Responsable de Pago</h3>
            
            {datos.huespedes && datos.huespedes.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3">Huéspedes en la habitación:</h4>
                <div className="space-y-2">
                  {datos.huespedes.map((huesped: Huesped, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{huesped.apellido}, {huesped.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {huesped.tipoDocumento}: {huesped.numeroDocumento}
                        </p>
                      </div>
                      <button
                        onClick={() => seleccionarResponsable(huesped.id)}
                        className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 text-sm"
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <h4 className="text-lg font-medium mb-3">Facturar a Tercero:</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUIT del Tercero
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 30-12345678-9"
                    value={datos.cuitTercero || ''}
                    onChange={(e) => setDatos({...datos, cuitTercero: e.target.value})}
                  />
                </div>
                <button
                  onClick={() => seleccionarResponsable(undefined, datos.cuitTercero)}
                  className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 w-full"
                >
                  Facturar a Tercero
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setPaso(1)}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Volver
            </button>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Items Facturables</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seleccionar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemsSeleccionados.map((item: ItemFacturable, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.tipo === 'ESTADIA' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.descripcion}</td>
                      <td className="px-4 py-3 font-medium">${item.monto.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.seleccionado}
                          onChange={() => toggleItem(index)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3">Resumen:</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">${datos.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo de Factura:</span>
                  <span className={`font-bold ${datos.tipoFactura === 'A' ? 'text-green-600' : 'text-blue-600'}`}>
                    {datos.tipoFactura || 'B'}
                  </span>
                </div>
                {datos.tipoFactura === 'A' && (
                  <>
                    <div className="flex justify-between">
                      <span>Neto:</span>
                      <span>${datos.neto?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (21%):</span>
                      <span>${datos.iva?.toFixed(2) || '0.00'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setPaso(2)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Volver
              </button>
              <button
                onClick={generarFactura}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Generar Factura
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="facturacion-container">
      {/* COMPONENTE MODAL - Renderizado condicionalmente */}
      <ModalMensaje
        isOpen={modalExito.show}
        titulo="¡Factura Generada!"
        mensaje={`La factura ha sido generada correctamente y está pendiente de pago.`}
        tipo="EXITO"
        onClose={handleCerrarModalExito}
      />

      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            paso >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className="flex-1 h-1 bg-gray-200">
            <div className={`h-full ${paso >= 2 ? 'bg-blue-600' : ''}`} style={{ width: '33%' }}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            paso >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <div className="flex-1 h-1 bg-gray-200">
            <div className={`h-full ${paso >= 3 ? 'bg-blue-600' : ''}`} style={{ width: '33%' }}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            paso >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={paso >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Datos</span>
          <span className={paso >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Responsable</span>
          <span className={paso >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Items</span>
        </div>
      </div>
      
      {renderizarPaso()}
    </div>
  );
};

export default FacturacionComponent;