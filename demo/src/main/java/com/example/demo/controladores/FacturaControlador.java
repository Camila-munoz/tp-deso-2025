// FacturacionController.java (sin DTOs)
package com.example.demo.controladores;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.*;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.repositorios.FacturaRepositorio;
import com.example.demo.servicios.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/facturacion")
@CrossOrigin(origins = "http://localhost:3000")
public class FacturaControlador {

    @Autowired
    private FacturaService facturacionService;
    
    @Autowired
    private EstadiaRepositorio estadiaRepository;
    
    @Autowired
    private FacturaRepositorio facturaRepository;
    
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
    
    // ==================== MANEJADOR DE EXCEPCIONES ====================
    
    @ExceptionHandler({ValidacionException.class, EntidadNoEncontradaException.class})
    public ResponseEntity<Map<String, Object>> handleExceptions(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        
        HttpStatus status = (ex instanceof ValidacionException) ? 
                HttpStatus.BAD_REQUEST : HttpStatus.NOT_FOUND;
        
        return new ResponseEntity<>(response, status);
    }
    
    // ==================== ENDPOINTS CU07 ====================
    
    /**
     * CU07 Paso 1-3: Validar datos iniciales
     */
    @PostMapping("/validar")
    public ResponseEntity<Map<String, Object>> validarDatosIniciales(
            @RequestBody Map<String, Object> request) {
        
        try {
            Integer numeroHabitacion = Integer.parseInt(request.get("numeroHabitacion").toString());
            LocalDateTime horaSalida = LocalDateTime.parse(request.get("horaSalida").toString(), formatter);
            
            Map<String, Object> validacion = facturacionService.validarDatosFacturacion(numeroHabitacion, horaSalida);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", validacion);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Formato de número de habitación inválido");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * CU07 Paso 4-5: Validar responsable
     */
    @PostMapping("/validar-responsable")
    public ResponseEntity<Map<String, Object>> validarResponsable(
            @RequestBody Map<String, Object> request) {
        
        try {
            Integer idHuesped = request.get("idHuesped") != null ? 
                    Integer.parseInt(request.get("idHuesped").toString()) : null;
            String cuitTercero = (String) request.get("cuitTercero");
            
            Map<String, Object> validacion = facturacionService.validarResponsable(idHuesped, cuitTercero);
            
            // Caso especial: necesita alta de responsable (CU03)
            if (validacion.containsKey("needsCU03")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("needsCU03", true);
                response.put("cuit", validacion.get("cuit"));
                response.put("message", "Debe dar de alta el responsable de pago primero (CU03)");
                
                return ResponseEntity.badRequest().body(response);
            }
            
            // Respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", validacion);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * CU07 Paso 6: Obtener items facturables
     */
    @GetMapping("/items/{estadiaId}")
    public ResponseEntity<Map<String, Object>> obtenerItemsFacturables(
            @PathVariable Integer estadiaId,
            @RequestParam String horaSalida,
            @RequestParam(required = false) String tipoResponsable,
            @RequestParam(required = false) String posicionIVA) {
        
        try {
            // Obtener estadía
            Estadia estadia = facturacionService.obtenerEstadia(estadiaId);
            LocalDateTime horaSalidaDT = LocalDateTime.parse(horaSalida, formatter);
            
            // Calcular items
            List<Map<String, Object>> items = facturacionService.calcularItemsFacturables(estadia, horaSalidaDT);
            
            // Calcular totales
            BigDecimal total = BigDecimal.ZERO;
            for (Map<String, Object> item : items) {
                Boolean seleccionado = (Boolean) item.get("seleccionado");
                if (seleccionado != null && seleccionado) {
                    BigDecimal monto = (BigDecimal) item.get("monto");
                    if (monto != null) {
                        total = total.add(monto);
                    }
                }
            }
            
            // Calcular IVA
            BigDecimal iva = BigDecimal.ZERO;
            BigDecimal neto = total;
            
            String tipoFactura = determinarTipoFacturaPreliminar(tipoResponsable, posicionIVA);
            if ("A".equals(tipoFactura)) {
                iva = total.multiply(new BigDecimal("0.21")).setScale(2, RoundingMode.HALF_UP);
                neto = total.subtract(iva);
            }
            
            // Preparar respuesta
            Map<String, Object> data = new HashMap<>();
            data.put("items", items);
            data.put("total", total);
            data.put("neto", neto);
            data.put("iva", iva);
            data.put("tipoFactura", tipoFactura);
            data.put("cantidadItems", items.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * CU07 Paso 7-8: Generar factura
     */
    @PostMapping("/generar")
    public ResponseEntity<Map<String, Object>> generarFactura(@RequestBody Map<String, Object> request) {
        try {
            // Extraer datos del request
            Integer estadiaId = Integer.parseInt(request.get("estadiaId").toString());
            Integer responsableId = Integer.parseInt(request.get("responsableId").toString());
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsSeleccionados = (List<Map<String, Object>>) request.get("itemsSeleccionados");
            
            // Validaciones básicas
            if (estadiaId == null) {
                throw new ValidacionException("ID de estadía requerido");
            }
            
            if (responsableId == null) {
                throw new ValidacionException("ID de responsable requerido");
            }
            
            if (itemsSeleccionados == null || itemsSeleccionados.isEmpty()) {
                throw new ValidacionException("Debe seleccionar al menos un ítem para facturar");
            }
            
            // Obtener entidades
            Estadia estadia = facturacionService.obtenerEstadia(estadiaId);
            ResponsableDePago responsable = facturacionService.obtenerResponsable(responsableId);
            
            // Generar factura
            Factura factura = facturacionService.generarFactura(estadia, responsable, itemsSeleccionados);
            
            // Preparar respuesta
            Map<String, Object> facturaData = new HashMap<>();
            facturaData.put("id", factura.getId());
            facturaData.put("numero", factura.getId()); // Asumiendo que ID es el número de factura
            facturaData.put("monto", factura.getMonto());
            facturaData.put("tipo", factura.getTipo());
            facturaData.put("estado", factura.getEstado());
            facturaData.put("fecha", LocalDateTime.now());
            
            // Datos de la habitación
            facturaData.put("habitacion", estadia.getHabitacion().getNumero());
            
            // Datos del cliente
            if (responsable instanceof PersonaFisica) {
                PersonaFisica pf = (PersonaFisica) responsable;
                facturaData.put("clienteTipo", "PERSONA_FISICA");
                // Podrías buscar el huésped asociado
            } else if (responsable instanceof PersonaJuridica) {
                PersonaJuridica pj = (PersonaJuridica) responsable;
                facturaData.put("clienteTipo", "PERSONA_JURIDICA");
                facturaData.put("razonSocial", pj.getRazon_Social());
                facturaData.put("cuit", pj.getCuit());
            }
            
            // Items facturados (solo los seleccionados)
            List<Map<String, Object>> itemsFacturados = new ArrayList<>();
            for (Map<String, Object> item : itemsSeleccionados) {
                Boolean seleccionado = (Boolean) item.get("seleccionado");
                if (seleccionado != null && seleccionado) {
                    Map<String, Object> itemFacturado = new HashMap<>();
                    itemFacturado.put("descripcion", item.get("descripcion"));
                    itemFacturado.put("monto", item.get("monto"));
                    itemsFacturados.add(itemFacturado);
                }
            }
            facturaData.put("items", itemsFacturados);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Factura generada exitosamente");
            response.put("factura", facturaData);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Formato de datos inválido");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Endpoint para obtener facturas pendientes (para CU16)
     */
    @GetMapping("/facturas-pendientes/{habitacionId}")
public ResponseEntity<Map<String, Object>> obtenerFacturasPendientes(@PathVariable Integer habitacionId) {
    try {
        List<Estadia> estadias = estadiaRepository.findByHabitacionId(habitacionId);
        List<Map<String, Object>> facturasPendientes = new ArrayList<>();
        
        for (Estadia estadia : estadias) {
            // Usar el método corregido
            List<Factura> facturas = facturaRepository.findByEstadiaIdAndEstado(
                estadia.getId(), 
                EstadoFactura.PENDIENTE
            );
            
            for (Factura factura : facturas) {
                Map<String, Object> facturaInfo = new HashMap<>();
                facturaInfo.put("id", factura.getId());
                facturaInfo.put("monto", factura.getMonto());
                facturaInfo.put("tipo", factura.getTipo());
                facturaInfo.put("estadiaId", estadia.getId());
                facturaInfo.put("responsable", factura.getResponsable());
                
                facturasPendientes.add(facturaInfo);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("facturas", facturasPendientes);
        response.put("cantidad", facturasPendientes.size());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
}
    
    /**
     * Método auxiliar para determinar tipo de factura
     */
    private String determinarTipoFacturaPreliminar(String tipoResponsable, String posicionIVA) {
        if ("JURIDICA".equals(tipoResponsable)) {
            return "A";
        } else if ("FISICA".equals(tipoResponsable) && 
                  "Responsable Inscripto".equalsIgnoreCase(posicionIVA)) {
            return "A";
        }
        return "B";
    }
}