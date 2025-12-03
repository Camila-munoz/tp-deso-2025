// Si existe la variable de entorno la usa, si no, usa localhost:8080 por defecto
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// --- AUTENTICACIÓN (CU01) ---
export interface ConserjeLogin {
  nombre: string;
  contrasena: string;
}

export const autenticarUsuario = async (datos: ConserjeLogin) => {
  const response = await fetch(`${API_URL}/conserjes/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Error al autenticar");
  }
  return data;
};

// --- HUÉSPEDES (CU02 y CU09) ---
export const buscarHuespedes = async (filtros: any) => {
  const params = new URLSearchParams();
  Object.keys(filtros).forEach(key => {
    if (filtros[key]) params.append(key, filtros[key]);
  });

  const res = await fetch(`${API_URL}/huespedes/buscar?${params.toString()}`);
  return res.json();
};

export const crearHuesped = async (huesped: any) => {
  const res = await fetch(`${API_URL}/huespedes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(huesped),
  });

  if (!res.ok) {
    const errorData = await res.text(); // A veces Spring devuelve texto plano
    throw { status: res.status, message: errorData };
  }
  return res.json();
};

export const crearHuespedForzado = async (huesped: any) => {
  const res = await fetch(`${API_URL}/huespedes/forzar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(huesped),
  });
  if (!res.ok) throw new Error("Error al forzar el alta");
  return res.json();
};

// --- FACTURACIÓN (CU07) ---
export const previsualizarFactura = async (idEstadia: number) => {
  const res = await fetch(`${API_URL}/facturas/previsualizar?idEstadia=${idEstadia}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener la previsualización");
  }
  return res.json();
};

export const confirmarFactura = async (facturaData: any) => {
  const res = await fetch(`${API_URL}/facturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(facturaData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al crear la factura");
  }
  return res.json();
};

// --- HABITACIONES (CU05 - Grilla) ---
export const getHabitaciones = async () => {
  const res = await fetch(`${API_URL}/habitaciones`);
  if (!res.ok) throw new Error("Error al obtener habitaciones");
  return res.json();
};

export const getEstadoHabitaciones = async (desde: string, hasta: string) => {
  const res = await fetch(`${API_URL}/habitaciones/estado?fechaDesde=${desde}&fechaHasta=${hasta}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al consultar estado");
  }
  return res.json();
};

// =================================================================
// AGREGADOS NUEVOS (CU04 y CU15) - INTEGRACIÓN
// =================================================================

// --- RESERVAS (CU04) ---
export const crearReserva = async (data: any) => {
  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    // Intentamos leer el JSON de error, si falla usamos un mensaje genérico
    const errorData = await res.json().catch(() => ({ message: "Error desconocido al reservar" }));
    throw new Error(errorData.message || "Error al crear la reserva");
  }
  return await res.json();
};

// --- ESTADÍAS / OCUPACIÓN (CU15) ---
export const crearEstadia = async (data: any) => {
  const res = await fetch(`${API_URL}/estadias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Error desconocido al ocupar" }));
    throw new Error(errorData.message || "Error al realizar el check-in");
  }
  return await res.json();
};