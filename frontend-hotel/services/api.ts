const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- AUTENTICACIÓN (CU01) ---

export interface ConserjeLogin {
  nombre: string;
  contrasena: string;
}

export const autenticarUsuario = async (datos: ConserjeLogin) => {
  const response = await fetch(`${API_URL}/conserjes/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

  const data = await res.json();

  return data; // mantiene success, message y data
};

export const crearHuesped = async (huesped: any) => {
  const res = await fetch(`${API_URL}/huespedes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(huesped),
  });

  // Si devuelve error 400, puede ser el caso de duplicado
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

// --- HABITACIONES (CU05) ---

export const getHabitaciones = async () => {
  const res = await fetch(`${API_URL}/habitaciones`);
  if (!res.ok) throw new Error("Error al obtener habitaciones");
  return res.json();
};

export const getEstadoHabitaciones = async (desde: string, hasta: string) => {
  // backend: /api/habitaciones/estado?fechaDesde=...&fechaHasta=...
  const res = await fetch(`${API_URL}/habitaciones/estado?fechaDesde=${desde}&fechaHasta=${hasta}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al consultar estado");
  }
  return res.json();

  
};

// --- CU10 MODIFICAR / CU11 BORRAR ---

// 1. Buscar los datos viejos para llenar el formulario
// GET /api/huespedes/{tipo}/{nro}
export const obtenerHuespedPorDocumento = async (tipo: string, nro: string) => {
  const res = await fetch(`${API_URL}/huespedes/${tipo}/${nro}`);
  if (!res.ok) throw new Error("No se pudo cargar el huésped");
  return res.json();
};

// 2. Enviar los cambios
// PUT /api/huespedes
export const modificarHuesped = async (huesped: any) => {
  const res = await fetch(`${API_URL}/huespedes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(huesped),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    // Manejo de errores específicos del CU (ej: duplicados o validaciones)
    throw new Error(errorData || "Error al modificar");
  }
  return res.json();
};

// 3. Borrar
// DELETE /api/huespedes/{tipo}/{nro}
export const darBajaHuesped = async (tipo: string, nro: string) => {
  const res = await fetch(`${API_URL}/huespedes/${tipo}/${nro}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || "Error al eliminar");
  }
  return true;
};

export const verificarHuespedAlojado = async (id: number) => {
  const res = await fetch(`${API_URL}/estadias/huesped/${id}/alojado`);
  if (!res.ok) throw new Error("Error al verificar historial");
  return res.json();
};

// ... (al final de la sección Modificación)

export const modificarHuespedForzado = async (huesped: any) => {
  const res = await fetch(`${API_URL}/huespedes/forzar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(huesped),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || "Error al forzar modificación");
  }
  return res.json();
};

export const buscarOcupantes = async (nroHabitacion: string) => {
  // Asegúrate de que API_URL esté definida al inicio de este archivo
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  const res = await fetch(`${API_URL}/estadias/habitacion/${nroHabitacion}/ocupantes`);
  
  if (res.status === 404) {
    throw new Error("La habitación indicada no se encuentra ocupada.");
  }
  if (!res.ok) {
    throw new Error("Error al buscar ocupantes.");
  }
  return res.json();
};