package com.example.demo.controladores;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Conserje;
import com.example.demo.servicios.ConserjeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/conserjes")
@CrossOrigin(origins = "*")
public class ConserjeControlador {

    @Autowired
    private ConserjeService conserjeService;

    // --- REGISTRAR NUEVO CONSERJE ---
    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody Conserje conserje) {
        try {
            System.out.println(" Registrando conserje: " + conserje.getNombre());
            
            boolean registrado = conserjeService.registrarConserje(conserje);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", " Conserje registrado correctamente",
                "id", conserje.getIdConserje()
            ));
            
        } catch (ValidacionException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", " " + e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", " Error interno del servidor"
            ));
        }
    }

    // --- LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Conserje conserje) {
        try {
            System.out.println(" Intento de login para: " + conserje.getNombre());
            
            boolean autenticado = conserjeService.autenticar(
                conserje.getNombre(), 
                conserje.getContrasena()
            );

            if (autenticado) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "✅ Login exitoso",
                    "usuario", conserje.getNombre()
                ));
            } else {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "❌ El usuario o la contraseña no son válidos"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ Error: " + e.getMessage()
            ));
        }
    }

    // --- BUSCAR POR NOMBRE ---
    @GetMapping("/{nombre}")
    public ResponseEntity<?> buscarPorNombre(@PathVariable String nombre) {
        try {
            return conserjeService.buscarPorNombre(nombre)
                .map(conserje -> ResponseEntity.ok(conserje))
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error al buscar conserje: " + e.getMessage()
            ));
        }
    }

    // --- LISTAR TODOS (para debugging) ---
    @GetMapping
    public ResponseEntity<?> listarTodos() {
        try {
            return ResponseEntity.ok(conserjeService.listarTodos());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error al listar conserjes: " + e.getMessage()
            ));
        }
    }

    // --- ENDPOINT DE PRUEBA ---
    @GetMapping("/status")
    public String status() {
        return "✅ Servicio de conserjes activo - Spring Data JPA";
    }
}