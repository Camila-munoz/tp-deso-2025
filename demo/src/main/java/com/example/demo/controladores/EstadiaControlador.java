package com.example.demo.controladores;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.modelo.Estadia;
import com.example.demo.servicios.EstadiaService;

@RestController
@RequestMapping("api/estadias")
@CrossOrigin(origins = "http://localhost:3000")
public class EstadiaControlador {
    
    @Autowired
    private EstadiaService estadiaService;

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, List<Long>> datos) {
        try {
        List<Long> idsHab = datos.get("idsHabitaciones");
        List<Long> idsHues = datos.get("idsHuespedes");
        
        Estadia nueva = estadiaService.crearEstadia(idsHab, idsHues);
        return ResponseEntity.ok(nueva);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
    }
}
