package com.example.demo.controladores;

import com.example.demo.modelo.Estadia;
import com.example.demo.servicios.EstadiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/estadias")
@CrossOrigin(origins = "*")
public class EstadiaControlador {

    @Autowired
    private EstadiaService estadiaService;

    // --- CREAR NUEVA ESTADÍA CON TODOS LOS DATOS ---
    @PostMapping
    public ResponseEntity<?> crearEstadia(@RequestBody CrearEstadiaRequest request) {
        try {
            System.out.println("📝 Creando estadía con datos: " + request);

            // Validaciones
            if (request.getIdHabitacion() == null || request.getIdHuesped() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ ID de habitación y huésped son obligatorios"
                ));
            }

            if (request.getCantidadHuespedes() == null || request.getCantidadHuespedes() <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ La cantidad de huéspedes debe ser mayor a 0"
                ));
            }

            if (request.getCantidadDias() == null || request.getCantidadDias() <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "❌ La cantidad de días debe ser mayor a 0"
                ));
            }

            Estadia estadia = estadiaService.crearEstadiaCompleta(request);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Estadía creada correctamente",
                "estadia", Map.of(
                    "id", estadia.getId(),
                    "checkIn", estadia.getCheckIn(),
                    "cantidadHuespedes", estadia.getCantidadHuespedes(),
                    "cantidadDias", estadia.getCantidadDias(),
                    "habitacion", estadia.getHabitacion().getId(),
                    "huesped", estadia.getHuesped().getNombre() + " " + estadia.getHuesped().getApellido(),
                    "idReserva", estadia.getIdReserva()
                )
            ));

        } catch (Exception e) {
            System.out.println("❌ Error creando estadía: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ Error: " + e.getMessage()
            ));
        }
    }

    // --- CLASE INTERNA PARA EL REQUEST ---
    public static class CrearEstadiaRequest {
        private Integer idHabitacion;
        private Integer idHuesped;
        private Integer cantidadHuespedes;
        private Integer cantidadDias;
        private Integer idReserva;

        // Constructores
        public CrearEstadiaRequest() {
        }

        public CrearEstadiaRequest(Integer idHabitacion, Integer idHuesped, Integer cantidadHuespedes, Integer cantidadDias, Integer idReserva) {
            this.idHabitacion = idHabitacion;
            this.idHuesped = idHuesped;
            this.cantidadHuespedes = cantidadHuespedes;
            this.cantidadDias = cantidadDias;
            this.idReserva = idReserva;
        }

        // Getters y Setters
        public Integer getIdHabitacion() { return idHabitacion; }
        public void setIdHabitacion(Integer idHabitacion) { this.idHabitacion = idHabitacion; }

        public Integer getIdHuesped() { return idHuesped; }
        public void setIdHuesped(Integer idHuesped) { this.idHuesped = idHuesped; }

        public Integer getCantidadHuespedes() { return cantidadHuespedes; }
        public void setCantidadHuespedes(Integer cantidadHuespedes) { this.cantidadHuespedes = cantidadHuespedes; }

        public Integer getCantidadDias() { return cantidadDias; }
        public void setCantidadDias(Integer cantidadDias) { this.cantidadDias = cantidadDias; }

        public Integer getIdReserva() { return idReserva; }
        public void setIdReserva(Integer idReserva) { this.idReserva = idReserva; }

        @Override
        public String toString() {
            return "CrearEstadiaRequest{" +
                    "idHabitacion=" + idHabitacion +
                    ", idHuesped=" + idHuesped +
                    ", cantidadHuespedes=" + cantidadHuespedes +
                    ", cantidadDias=" + cantidadDias +
                    ", idReserva=" + idReserva +
                    '}';
        }
    }

    // --- VERIFICAR SI HUÉSPED SE HA ALOJADO ANTES (CU11) ---
    @GetMapping("/huesped/{idHuesped}/alojado")
    public ResponseEntity<?> verificarHuespedAlojado(@PathVariable Integer idHuesped) {
        try {
            boolean seHaAlojado = estadiaService.huespedSeHaAlojado(idHuesped);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "huespedId", idHuesped,
                "seHaAlojado", seHaAlojado,
                "message", seHaAlojado ? 
                    "✅ El huésped se ha alojado antes" : 
                    "❌ El huésped NO se ha alojado antes"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ Error: " + e.getMessage()
            ));
        }
    }

    // --- ENDPOINT DE PRUEBA ---
    @GetMapping("/status")
    public String status() {
        return "✅ Servicio de estadías activo";
    }
}