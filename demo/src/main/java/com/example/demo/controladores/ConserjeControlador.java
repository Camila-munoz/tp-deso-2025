package com.example.demo.controladores;

import com.example.demo.modelo.Conserje;
import com.example.demo.servicios.ConserjeService;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/conserjes")
@CrossOrigin(origins = "http://localhost:3000")
public class ConserjeControlador {
    
    @Autowired  
    private ConserjeService conserjeService;

    @PostMapping()
    public ResponseEntity<?> autenticar(@RequestBody Map<String, String> credenciales) {
        
        try {

            String usuario = credenciales.get("usuario");
            String contrasenia = credenciales.get("contrasenia");
            
            // 1. Llamamos al servicio
            Conserje conserje = conserjeService.autenticarUsuario(usuario, contrasenia);
            
            // 2. SEGURIDAD: No devolvemos la contraseña al frontend
            conserje.setContrasenia(null); 
            
            // 3. Devolvemos 200 OK con el objeto (sin clave)
            return ResponseEntity.ok(conserje);
            
        } catch (Exception e) {
            // 4. Si falla (usuario no existe o clave mal), devolvemos 401 Unauthorized
            return ResponseEntity.status(401).body("Error de autenticación: " + e.getMessage());
        }
    }
}
