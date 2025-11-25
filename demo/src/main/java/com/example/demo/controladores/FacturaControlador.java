package com.example.demo.controladores;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Factura;
import com.example.demo.servicios.FacturaService;
import com.example.demo.servicios.request.CrearFacturaRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "*")
public class FacturaControlador {

    @Autowired
    private FacturaService facturaService;

    // --- 1. CREAR NUEVA FACTURA ---
    // POST http://localhost:8080/api/facturas
    @PostMapping
    public ResponseEntity<?> crearFactura(@RequestBody CrearFacturaRequest request) {
        try {
            Factura factura = facturaService.crearFactura(request);
            
            return new ResponseEntity<>(Map.of(
                "success", true,
                "message", "✅ Factura creada exitosamente",
                "id", factura.getId(),
                "monto", factura.getMonto(),
                "estado", factura.getEstado().toString()
            ), HttpStatus.CREATED); // 201 CREATED

        } catch (EntidadNoEncontradaException e) {
            // Estadia o Responsable no encontrado
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "❌ Error de relación: " + e.getMessage()
            ));
        } catch (ValidacionException e) {
            // Monto inválido, tipo incorrecto, etc.
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "❌ Error de validación: " + e.getMessage()
            ));
        } catch (Exception e) {
            // Error de DB o interno
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "❌ Error interno: " + e.getMessage()
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
}