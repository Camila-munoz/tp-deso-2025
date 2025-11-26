package com.example.demo.controladores;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Reserva;
import com.example.demo.servicios.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    
    @GetMapping
    public List<Reserva> listar() {
        return reservaService.listarTodas();
    }
}