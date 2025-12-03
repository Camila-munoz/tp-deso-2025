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