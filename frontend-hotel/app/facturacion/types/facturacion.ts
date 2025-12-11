// types/facturacion.ts
export interface DatosFacturacion {
  numeroHabitacion?: string;
  horaSalida?: string;
  cuitTercero?: string;
  estadia?: Estadia;
  huespedes?: Huesped[];
  responsable?: ResponsableData;
  total?: number;
  tipoFactura?: string;
  neto?: number;
  iva?: number;
}

export interface Huesped {
  id: number;
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
}

export interface Estadia {
  id: number;
  cantidadDias: number;
  checkIn: string;
  checkOut?: string;
  habitacion: Habitacion;
}

export interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  costo: number;
}

export interface ResponsableData {
  tipo: 'FISICA' | 'JURIDICA';
  responsable: {
    id: number;
    // otros campos según tu backend
  };
  huesped?: Huesped;
  nombreCompleto?: string;
  posicionIVA?: string;
  cuit?: string;
  razonSocial?: string;
}

export interface ItemFacturable {
  tipo: string;
  descripcion: string;
  monto: number;
  seleccionado: boolean;
}

// types/facturacion.ts (actualizado)
export interface FacturaGenerada {
  id: number;
  numero: number;
  monto: number;
  tipo: string;
  estado: string;
  fecha: string;
  habitacion: string;
  clienteTipo?: 'PERSONA_FISICA' | 'PERSONA_JURIDICA';
  razonSocial?: string;
  cuit?: string;
  items?: Array<{
    descripcion: string;
    monto: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  needsCU03?: boolean;
  message?: string;
}