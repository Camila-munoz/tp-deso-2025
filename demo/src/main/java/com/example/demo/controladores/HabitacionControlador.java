package com.example.demo.controladores;

import com.example.demo.modelo.Habitacion;
import com.example.demo.repositorios.HabitacionRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController 
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "*") // Permite peticiones desde el Frontend
public class HabitacionControlador {

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;

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
}