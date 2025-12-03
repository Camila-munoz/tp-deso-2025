"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useCancelarReservas() {
  // cancelar múltiples usando el endpoint que ya definiste
  const cancelarMultiples = async (ids: number[]) => {
    const res = await fetch(`${API_URL}/api/reservas/cancelar-multiples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => null);
      throw new Error(text || "Error al cancelar reservas (múltiples)");
    }
    return res.json();
  };

  const cancelarIndividual = async (id: number) => {
    const res = await fetch(`${API_URL}/api/reservas/${id}/cancelar`, {
      method: "PUT",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => null);
      throw new Error(text || "Error al cancelar reserva");
    }
    return res.json();
  };

  return { cancelarMultiples, cancelarIndividual };
}
