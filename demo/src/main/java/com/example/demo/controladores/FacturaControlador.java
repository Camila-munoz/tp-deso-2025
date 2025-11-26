package com.example.demo.controladores;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Factura;
import com.example.demo.servicios.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "*")
public class FacturaControlador {

    @Autowired
    private FacturaService facturaService;

    // --- 1. CREAR NUEVA FACTURA (POST http://localhost:8080/api/facturas) ---
    // Recibe la entidad Factura directamente en el cuerpo JSON.
    @PostMapping
    public ResponseEntity<?> crearFactura(@RequestBody Factura factura) {
        try {
            Factura facturaCreada = facturaService.crearFactura(factura);
            
            return new ResponseEntity<>(Map.of(
                "success", true,
                "message", "✅ Factura creada exitosamente",
                "id", facturaCreada.getId(),
                "monto", facturaCreada.getMonto(),
                "estado", facturaCreada.getEstado().toString()
            ), HttpStatus.CREATED); // 201 CREATED

        } catch (EntidadNoEncontradaException e) {
            // Este catch ya no se usa porque el servicio fue adaptado para no buscar.
            // Si ocurriera un error en la persistencia por FK inválida, caería en Exception (500).
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "❌ Error de relación: " + e.getMessage()
            ));
        } catch (ValidacionException e) {
            // Monto inválido, tipo incorrecto, o ID de relación faltante.
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ Error de validación: " + e.getMessage()
            ));
        } catch (Exception e) {
            // Captura errores de persistencia (ej. ConstraintViolationException por FK no existente)
            System.err.println("Error al crear factura: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "❌ Error interno al persistir la factura. Asegúrese de que los IDs de Estadía y Responsable existan. Detalle: " + e.getMessage()
            ));
        }
    }

    // --- 2. MARCAR FACTURA COMO PAGADA ---
    // PUT http://localhost:8080/api/facturas/1/pagar
    @PutMapping("/{id}/pagar")
    public ResponseEntity<?> pagarFactura(@PathVariable Integer id) {
        try {
            Factura facturaPagada = facturaService.marcarComoPagada(id);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Factura ID " + id + " marcada como PAGADA",
                "estado", facturaPagada.getEstado().toString()
            ));
        } catch (EntidadNoEncontradaException e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "❌ " + e.getMessage()
            ));
        } catch (ValidacionException e) {
             return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ " + e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "❌ Error interno del servidor"
            ));
        }
    }
    
    // Aquí puedes agregar otros endpoints (GET /id, GET /, DELETE /id, etc.)
    @GetMapping("/previsualizar")
    public ResponseEntity<?> previsualizarFactura(@RequestParam Integer idEstadia) {
        try {
            return ResponseEntity.ok(facturaService.generarPrevisualizacion(idEstadia));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}