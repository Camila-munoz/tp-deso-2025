package com.example.demo.controladores;

import com.example.demo.modelo.Reserva;
import com.example.demo.servicios.ReservaService;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:3000")
public class ReservaControlador {

    @Autowired
    private ReservaService reservaService;

    // CU04: Crear Reserva
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> datos) {
        try {
            // 1. Extraer datos del Map (Casteo manual)
            String fechaInStr = (String) datos.get("fechaEntrada");
            String fechaOutStr = (String) datos.get("fechaSalida");
            
            Long idHuesped = ((Number) datos.get("idHuesped")).longValue();
            
            List<?> lista = (List<?>) datos.get("idsHabitaciones");
            List<Long> idsHabitaciones = lista.stream()
                .map(num -> ((Number) num).longValue())
                .collect(Collectors.toList());

            // 2. Convertir fechas
            LocalDate fEntrada = LocalDate.parse(fechaInStr);
            LocalDate fSalida = LocalDate.parse(fechaOutStr);

            // 3. Llamar al servicio
            Reserva nueva = reservaService.crearReserva(fEntrada, fSalida, idHuesped, idsHabitaciones);
            return ResponseEntity.ok(nueva);

        } catch (ValidacionException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (EntidadNoEncontradaException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar datos: " + e.getMessage());
        }
    }

    // CU06: Cancelar
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            reservaService.cancelarReserva(id);
            return ResponseEntity.ok("Reserva cancelada con éxito");
        } catch (EntidadNoEncontradaException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
    
    // Buscar para listar antes de cancelar
    @GetMapping
    public ResponseEntity<List<Reserva>> buscarPorApellido(@RequestParam String apellido) {
        return ResponseEntity.ok(reservaService.buscarPorApellido(apellido));
    }
}