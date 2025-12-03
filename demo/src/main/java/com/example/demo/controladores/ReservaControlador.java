package com.example.demo.controladores;

<<<<<<< HEAD
=======
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.EstadoReserva;
import com.example.demo.modelo.Reserva;
import com.example.demo.servicios.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

>>>>>>> 184c1c37a88dfd64cd44eb15ef264ea4f1038fb3
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.modelo.Reserva;
import com.example.demo.servicios.ReservaService;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaControlador {

    @Autowired
    private ReservaService reservaService;

    // --- CU04: CREAR RESERVA ---
    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody ReservaRequest request) {
        try {
            List<Reserva> nuevas = reservaService.crearReserva(
                request.getDetalles(),
                request.getNombre(),
                request.getApellido(),
                request.getTelefono()
            );
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Reservas creadas"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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
    // Clase interna para mapear la solicitud de creación de reserva
    public static class ReservaRequest {
        private String nombre;
        private String apellido;
        private String telefono;
        private List<DetalleReserva> detalles;

        public ReservaRequest() {}
        
        // Getters y Setters
        public String getNombre() { return nombre; }
        public void setNombre(String n) { this.nombre = n; }
        public String getApellido() { return apellido; }
        public void setApellido(String a) { this.apellido = a; }
        public String getTelefono() { return telefono; }
        public void setTelefono(String t) { this.telefono = t; }
        public List<DetalleReserva> getDetalles() { return detalles; }
        public void setDetalles(List<DetalleReserva> d) { this.detalles = d; }
    }
    public static class DetalleReserva {
        private Integer idHabitacion;
        private String fechaEntrada;
        private String fechaSalida;

        // Getters y Setters
        public Integer getIdHabitacion() { return idHabitacion; }
        public void setIdHabitacion(Integer id) { this.idHabitacion = id; }
        public String getFechaEntrada() { return fechaEntrada; }
        public void setFechaEntrada(String f) { this.fechaEntrada = f; }
        public String getFechaSalida() { return fechaSalida; }
        public void setFechaSalida(String f) { this.fechaSalida = f; }
    }
}