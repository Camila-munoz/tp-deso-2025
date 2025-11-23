package com.example.demo.controllers;

import com.example.demo.dominio.Huesped;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.servicios.HuespedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/huespedes")
public class HuespedController {

    @Autowired
    private HuespedService huespedService;

    // --- 1. LISTAR TODOS ---
    @GetMapping
    public List<Huesped> listarTodos() {
        return huespedService.listarTodos();
    }

    // --- 2. BUSCAR POR DOCUMENTO (CU02) ---
    // OJO: La URL ahora recibe DOS parámetros
    // Ejemplo: GET http://localhost:8080/api/huespedes/DNI/30123456
    @GetMapping("/{tipoDoc}/{nroDoc}")
    public ResponseEntity<?> buscarHuesped(
            @PathVariable String tipoDoc, 
            @PathVariable String nroDoc) {
        
        try {
            Huesped huesped = huespedService.buscarHuesped(tipoDoc, nroDoc);
            return new ResponseEntity<>(huesped, HttpStatus.OK);
        } catch (EntidadNoEncontradaException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // --- 3. DAR DE ALTA (CU09) ---
    // POST http://localhost:8080/api/huespedes
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Huesped huesped) {
        try {
            huespedService.darAltaHuesped(huesped);
            return new ResponseEntity<>("Huésped creado con éxito", HttpStatus.CREATED);
        } catch (ValidacionException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 4. MODIFICAR (CU10) ---
    // PUT http://localhost:8080/api/huespedes
    @PutMapping
    public ResponseEntity<?> modificar(@RequestBody Huesped huesped) {
        try {
            huespedService.modificarHuesped(huesped);
            return new ResponseEntity<>("Huésped modificado con éxito", HttpStatus.OK);
        } catch (EntidadNoEncontradaException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (ValidacionException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- 5. DAR DE BAJA (CU11) ---
    // DELETE http://localhost:8080/api/huespedes/DNI/30123456
    @DeleteMapping("/{tipoDoc}/{nroDoc}")
    public ResponseEntity<?> borrar(
            @PathVariable String tipoDoc, 
            @PathVariable String nroDoc) {
        
        try {
            huespedService.darBajaHuesped(tipoDoc, nroDoc);
            return new ResponseEntity<>("Huésped eliminado con éxito", HttpStatus.NO_CONTENT);
        } catch (EntidadNoEncontradaException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
