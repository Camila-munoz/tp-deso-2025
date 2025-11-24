package com.example.demo.controllers;

import com.example.demo.dominio.Conserje;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.servicios.GestorConserjes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/conserje")
public class ConserjeController {

    @Autowired
    private GestorConserjes gestor;

    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody Conserje c) {

        boolean ok = gestor.registrar(c);

        if(ok){
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Conserje registrado correctamente"
            ));
        }

        return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "❌ Error al registrar conserje"
        ));
    }
}
