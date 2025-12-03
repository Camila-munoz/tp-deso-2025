package com.example.demo.controladores;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.EstadoReserva;
import com.example.demo.modelo.Reserva;
import com.example.demo.servicios.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservaControlador {

    @Autowired
    private ReservaService reservaService;

    // --- CU04: CREAR RESERVA ---
    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody Map<String, Object> datos) {
        try {
            // 1. Extraer y convertir datos manualmente desde el Mapa
            String fEntradaStr = (String) datos.get("fechaEntrada");
            String fSalidaStr = (String) datos.get("fechaSalida");
            Integer idHuesped = (Integer) datos.get("idHuesped");
            
            // Convertir la lista de habitaciones (JSON Array -> List<Integer>)
            List<?> listaHab = (List<?>) datos.get("idsHabitaciones");
            if (listaHab == null) throw new ValidacionException("Falta la lista de habitaciones");
            
            List<Integer> idsHabitaciones = listaHab.stream()
                .map(num -> (Integer) num)
                .collect(Collectors.toList());

            // 2. Convertir Fechas (String -> LocalDate)
            LocalDate fechaEntrada = LocalDate.parse(fEntradaStr);
            LocalDate fechaSalida = LocalDate.parse(fSalidaStr);

            // 3. Llamar al servicio
            Reserva nueva = reservaService.crearReserva(fechaEntrada, fechaSalida, idHuesped, idsHabitaciones);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Reserva creada con éxito",
                "reservaId", nueva.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    // --- CU06: CANCELAR RESERVA ---
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarReserva(@PathVariable Integer id) {
        try {
            reservaService.cancelarReserva(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Reserva cancelada correctamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error al cancelar: " + e.getMessage()
            ));
        }
    }
    // --- NUEVO: Buscar reservas por huésped (para CU06) ---
    @GetMapping("/huesped/{idHuesped}")
    public ResponseEntity<?> buscarPorHuesped(@PathVariable Integer idHuesped) {
        try {
            List<Reserva> reservas = reservaService.buscarPorHuesped(idHuesped);
            
            // Filtrar solo reservas activas (no canceladas)
            List<Reserva> reservasActivas = reservas.stream()
                .filter(r -> r.getEstado() != EstadoReserva.CANCELADA)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(reservasActivas);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error al buscar reservas: " + e.getMessage()
            ));
        }
    }

    // --- NUEVO: Cancelar múltiples reservas ---
    @PostMapping("/cancelar-multiples")
    public ResponseEntity<?> cancelarMultiplesReservas(@RequestBody List<Integer> idsReservas) {
        try {
            if (idsReservas == null || idsReservas.isEmpty()) {
                throw new ValidacionException("No se proporcionaron reservas para cancelar");
            }
            
            int canceladas = 0;
            List<String> errores = new ArrayList<>();
            
            for (Integer idReserva : idsReservas) {
                try {
                    reservaService.cancelarReserva(idReserva);
                    canceladas++;
                } catch (Exception e) {
                    errores.add("Reserva " + idReserva + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("success", errores.isEmpty());
            respuesta.put("canceladas", canceladas);
            respuesta.put("total", idsReservas.size());
            
            if (!errores.isEmpty()) {
                respuesta.put("errores", errores);
                respuesta.put("message", "Algunas reservas no pudieron ser canceladas");
            } else {
                respuesta.put("message", canceladas + " reserva(s) cancelada(s) correctamente");
            }
            
            return ResponseEntity.ok(respuesta);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping
    public List<Reserva> listar() {
        return reservaService.listarTodas();
    }
}