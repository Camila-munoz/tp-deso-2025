package com.example.demo.controladores;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Huesped;
import com.example.demo.modelo.TipoDocumento;
import com.example.demo.servicios.HuespedService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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

    // --- NUEVO ENDPOINT: CU02 BÚSQUEDA FLEXIBLE ---
    // GET http://localhost:8080/api/huespedes/buscar?apellido=MESSI&tipoDoc=DNI
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarHuespedesPorCriterios(
        @RequestParam(required = false) String apellido,
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String numDoc,
        @RequestParam(required = false) TipoDocumento tipoDoc) { 

        try {
            List<Huesped> resultados = huespedService.buscarHuespedes(
                apellido,
                nombre,
                numDoc,
                tipoDoc
            );
            
            if (resultados.isEmpty()) {
                // Flujo Alternativo 5.A.1 del CU02: No se encontraron huéspedes.
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "No se encontraron huéspedes con los criterios de búsqueda. Puede proceder a dar de alta uno nuevo."
                ));
            }

            // Flujo Principal del CU02: Huéspedes encontrados.
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", resultados.size() + " huéspedes encontrados.",
                "data", resultados
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error interno al procesar la búsqueda: " + e.getMessage()
            ));
        }
    }
    
    // --- CU09: DAR DE ALTA (Endpoint original refactorizado para usar el servicio) ---
    // POST http://localhost:8080/api/huespedes
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Huesped huesped) {
        try {
            Huesped nuevoHuesped = huespedService.darAltaHuesped(huesped); // Flujo principal
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoHuesped);
        } catch (ValidacionException e) {
            // Este error captura el Flujo Alternativo 2.B (Huésped duplicado).
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Captura errores de DB o internos
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }
    
    // --- NUEVO ENDPOINT: Alta Forzada (Respuesta al Flujo Alternativo 2.B) ---
    // POST http://localhost:8080/api/huespedes/forzar
    // Se usa cuando el frontend recibe el error de ValidacionException ("Huésped ya existe") 
    // y el usuario elige "ACEPTAR" guardar el duplicado.
    @PostMapping("/forzar")
    public ResponseEntity<?> crearForzado(@RequestBody Huesped huesped) {
        try {
            Huesped nuevoHuesped = huespedService.altaHuespedForzada(huesped); 
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoHuesped);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al forzar el alta: " + e.getMessage());
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
