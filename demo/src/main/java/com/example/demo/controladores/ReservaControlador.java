package com.example.demo.controladores;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.excepciones.ValidacionException;
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
    // --- Buscar reservas por huésped ---
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorApellido(@RequestParam String apellido) {
        try {
            List<Reserva> reservas = reservaService.buscarParaCancelar(apellido);
            
            if (reservas.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "No se encontraron reservas para el apellido: " + apellido));
            }
            
            return ResponseEntity.ok(reservas);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Cancelar reserva por ID ---
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