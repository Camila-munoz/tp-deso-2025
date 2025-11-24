package com.example.demo.controladores;

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
    public ResponseEntity<?> checkIn(@RequestBody Map<String, Integer> datos) {
        try {
            Integer idHab = datos.get("idHabitacion");
            Integer idHuesped = datos.get("idHuesped");
            
            Estadia nueva = estadiaService.crearEstadia(idHab, idHuesped);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
