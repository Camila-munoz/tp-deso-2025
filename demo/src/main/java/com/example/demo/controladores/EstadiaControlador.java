package com.example.demo.controladores;

import com.example.demo.modelo.Estadia;
import com.example.demo.servicios.EstadiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/estadias")
@CrossOrigin(origins = "*")
public class EstadiaControlador {

    @Autowired
    private EstadiaService estadiaService;

    /// --- CU15: OCUPAR (CHECK-IN) ---
    @PostMapping
    public ResponseEntity<?> crearEstadia(@RequestBody CrearEstadiaRequest request) {
        try {
            if (request.getIdHabitacion() == null || request.getIdHuespedTitular() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Faltan datos obligatorios."));
            }

            Estadia nueva = estadiaService.crearEstadia(request);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Check-in realizado con éxito.",
                "estadia", nueva
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- CU11: Verificar Historial ---
    @GetMapping("/huesped/{id}/alojado")
    public ResponseEntity<?> verificarAlojado(@PathVariable Integer id) {
        boolean seHaAlojado = estadiaService.huespedSeHaAlojado(id);
        return ResponseEntity.ok(Map.of("seHaAlojado", seHaAlojado));
    }

    // --- CLASE INTERNA PARA EL REQUEST ---
    public static class CrearEstadiaRequest {
        private Integer idHabitacion;
        private Integer idHuespedTitular;
        private List<Integer> idHuespedesAcompanantes;
        private Integer cantidadHuespedes;
        private Integer cantidadDias;
        private Integer idReserva;

        // Constructores
        public CrearEstadiaRequest() {
        }

        // Getters y Setters
        public Integer getIdHabitacion() { return idHabitacion; }
        public void setIdHabitacion(Integer idHabitacion) { this.idHabitacion = idHabitacion; }

        public Integer getIdHuespedTitular() { return idHuespedTitular; }
        public void setIdHuespedTitular(Integer idHuespedTitular) { this.idHuespedTitular = idHuespedTitular; }

        public List<Integer> getIdHuespedesAcompanantes() { return idHuespedesAcompanantes; }
        public void setIdHuespedesAcompanantes(List<Integer> idHuespedesAcompanantes) { this.idHuespedesAcompanantes = idHuespedesAcompanantes; }

        public Integer getCantidadHuespedes() { return cantidadHuespedes; }
        public void setCantidadHuespedes(Integer cantidadHuespedes) { this.cantidadHuespedes = cantidadHuespedes; }

        public Integer getCantidadDias() { return cantidadDias; }
        public void setCantidadDias(Integer cantidadDias) { this.cantidadDias = cantidadDias; }

        public Integer getIdReserva() { return idReserva; }
        public void setIdReserva(Integer idReserva) { this.idReserva = idReserva; }

    }

    // --- ENDPOINT DE PRUEBA ---
    @GetMapping("/status")
    public String status() {
        return "Servicio de estadías activo";
    }
}