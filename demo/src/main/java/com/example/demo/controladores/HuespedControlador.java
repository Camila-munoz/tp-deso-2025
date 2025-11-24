package com.example.demo.controladores;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Huesped;
import com.example.demo.servicios.HuespedService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/huespedes")
@CrossOrigin(origins = "http://localhost:3000")
public class HuespedControlador {

    @Autowired
    private HuespedService huespedService;

    // --- 1. LISTAR TODOS ---
    @GetMapping
    public ResponseEntity<List<Huesped>> listar() {
        return ResponseEntity.ok(huespedService.listarTodos());
    }

    // --- 2. BUSCAR POR DOCUMENTO (CU02) ---
    // GET http://localhost:8080/api/huespedes/DNI/(dni)
    @GetMapping("/{tipoDoc}/{nroDoc}")
    public ResponseEntity<?> buscarHuesped(
            @PathVariable String tipoDoc, 
            @PathVariable String nroDoc) {
        
        try {
            Huesped huesped = huespedService.buscarHuesped(tipoDoc, nroDoc);
            return ResponseEntity.ok(huesped);
        } catch (EntidadNoEncontradaException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // --- 3. DAR DE ALTA (CU09) ---
    // POST http://localhost:8080/api/huespedes
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Huesped huesped) {
        try {
            Huesped nuevoHuesped = huespedService.darAltaHuesped(huesped);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoHuesped);
        } catch (ValidacionException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }

    // --- 4. MODIFICAR (CU10) ---
    // PUT http://localhost:8080/api/huespedes
    @PutMapping
    public ResponseEntity<?> modificar(@RequestBody Huesped huesped) {
        try {
            Huesped huespedActualizado = huespedService.modificarHuesped(huesped);
            return ResponseEntity.ok(huespedActualizado);
        } catch (EntidadNoEncontradaException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (ValidacionException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- 5. DAR DE BAJA (CU11) ---
    // DELETE http://localhost:8080/api/huespedes/DNI/(dni)
    @DeleteMapping("/{tipoDoc}/{nroDoc}")
    public ResponseEntity<?> borrar(
            @PathVariable String tipoDoc, 
            @PathVariable String nroDoc) {
        
        try {
            huespedService.darBajaHuesped(tipoDoc, nroDoc);
            return ResponseEntity.noContent().build(); 
        } catch (EntidadNoEncontradaException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
