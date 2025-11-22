package com.example.demo.controllers; // <--- Asegúrate que coincida con tu carpeta

import com.example.demo.dominio.Habitacion;
import com.example.demo.datos.dao.HabitacionDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController // 1. Indica que esto maneja peticiones web
@RequestMapping("/api/habitaciones") // 2. Define la URL base
public class HabitacionController {

    @Autowired
    private HabitacionDAO habitacionDAO;

    // 3. Cuando entres al navegador, se ejecuta esto (GET)
    @GetMapping
    public List<Habitacion> obtenerTodas() {
        return habitacionDAO.listarTodas();
    }
    
    // 4. Para guardar (POST) - Requisito del TP
    @PostMapping
    public void guardar(@RequestBody Habitacion habitacion) {
        habitacionDAO.guardar(habitacion);
    }
}
