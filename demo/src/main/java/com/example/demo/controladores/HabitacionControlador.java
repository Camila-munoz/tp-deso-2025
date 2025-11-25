package com.example.demo.controladores;

import com.example.demo.modelo.Habitacion;
import com.example.demo.repositorios.HabitacionRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController 
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "http://localhost:3000")
public class HabitacionControlador {

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;

    @GetMapping
    public List<Habitacion> listar() {
        return habitacionRepositorio.findAll();
    }
    
    
    @PostMapping
    public void guardar(@RequestBody Habitacion habitacion) {
        habitacionRepositorio.save(habitacion);
    }
}
