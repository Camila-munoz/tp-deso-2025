package com.example.demo.controladores;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.EstadoHabitacion;
import com.example.demo.modelo.Habitacion;
import com.example.demo.repositorios.HabitacionRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import com.example.demo.servicios.HabitacionService;

@RestController 
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "*") // Permite peticiones desde el Frontend
public class HabitacionControlador {

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;
    
    @Autowired
    private HabitacionService habitacionService; 

    // LISTAR
    @GetMapping
    public ResponseEntity<List<Habitacion>> listar() {
        return ResponseEntity.ok(habitacionRepositorio.findAll());
    }
    
    // GUARDAR 
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Habitacion habitacion) {
        try {
            Habitacion nueva = habitacionRepositorio.save(habitacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "✅ Habitación creada correctamente",
                "habitacion", nueva
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ Error al crear habitación: " + e.getMessage()
            ));
        }
    }

    // --- NUEVO: CU05 Mostrar Estado de Habitaciones ---
    // GET /api/habitaciones/estado?fechaDesde=AAAA-MM-DD&fechaHasta=AAAA-MM-DD
    @GetMapping("/estado")
    public ResponseEntity<?> mostrarEstado(
        @RequestParam String fechaDesde, 
        @RequestParam String fechaHasta) {
        
        try {
           LocalDate fDesde = LocalDate.parse(fechaDesde);
            LocalDate fHasta = LocalDate.parse(fechaHasta);
            
            // Ahora devuelve una Lista de celdas, no un mapa simple
            List<Map<String, Object>> grilla = habitacionService.mostrarEstadoHabitaciones(fDesde, fHasta);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", grilla 
            ));
        } catch (ValidacionException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ Error de validación: " + e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "❌ Error interno al consultar estado: " + e.getMessage()
            ));
        }
    }
}