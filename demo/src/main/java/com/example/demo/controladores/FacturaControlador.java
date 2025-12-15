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
    
    // MÉTODO AUXILIAR PARA EVITAR CASTING ERROR
    private BigDecimal convertirABigDecimal(Object valor) {
        if (valor == null) return BigDecimal.ZERO;
        if (valor instanceof BigDecimal) return (BigDecimal) valor;
        if (valor instanceof Integer) return BigDecimal.valueOf((Integer) valor);
        if (valor instanceof Long) return BigDecimal.valueOf((Long) valor);
        if (valor instanceof Double) return BigDecimal.valueOf((Double) valor);
        if (valor instanceof String) return new BigDecimal((String) valor);
        return new BigDecimal(valor.toString());
    }

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
    
    @PostMapping("/validar")
    public ResponseEntity<Map<String, Object>> validarDatosIniciales(
            @RequestBody Map<String, Object> request) {
        try {
            if (request.get("numeroHabitacion") == null) throw new ValidacionException("Falta número de habitación");
            if (request.get("horaSalida") == null) throw new ValidacionException("Falta hora de salida");

            Integer numeroHabitacion = Integer.parseInt(request.get("numeroHabitacion").toString());
            LocalDateTime horaSalida = LocalDateTime.parse(request.get("horaSalida").toString(), formatter);
            
            Map<String, Object> validacion = facturacionService.validarDatosFacturacion(numeroHabitacion, horaSalida);
            
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
    
    @PostMapping("/validar-responsable")
    public ResponseEntity<Map<String, Object>> validarResponsable(
            @RequestBody Map<String, Object> request) {
        try {
            Integer idHuesped = request.get("idHuesped") != null ? 
                    Integer.parseInt(request.get("idHuesped").toString()) : null;
            String cuitTercero = (String) request.get("cuitTercero");
            
            Map<String, Object> validacion = facturacionService.validarResponsable(idHuesped, cuitTercero);
            
            if (validacion.containsKey("needsCU03")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("needsCU03", true);
                response.put("cuit", validacion.get("cuit"));
                response.put("message", "Debe dar de alta el responsable de pago primero (CU03)");
                return ResponseEntity.badRequest().body(response);
            }
            
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
    
    @GetMapping("/items/{estadiaId}")
    public ResponseEntity<Map<String, Object>> obtenerItemsFacturables(
            @PathVariable Integer estadiaId,
            @RequestParam String horaSalida,
            @RequestParam(required = false) String tipoResponsable,
            @RequestParam(required = false) String posicionIVA) {
        
        try {
            Estadia estadia = facturacionService.obtenerEstadia(estadiaId);
            LocalDateTime horaSalidaDT = LocalDateTime.parse(horaSalida, formatter);
            
            List<Map<String, Object>> items = facturacionService.calcularItemsFacturables(estadia, horaSalidaDT);
            
            BigDecimal total = BigDecimal.ZERO;
            for (Map<String, Object> item : items) {
                Boolean seleccionado = (Boolean) item.get("seleccionado");
                if (seleccionado != null && seleccionado) {
                    // USO DE CONVERSIÓN SEGURA
                    BigDecimal monto = convertirABigDecimal(item.get("monto"));
                    if (monto != null) {
                        total = total.add(monto);
                    }
                }
            }
            
            BigDecimal iva = BigDecimal.ZERO;
            BigDecimal neto = total;
            
            String tipoFactura = determinarTipoFacturaPreliminar(tipoResponsable, posicionIVA);
            if ("A".equals(tipoFactura)) {
                neto = total.divide(new BigDecimal("1.21"), 2, RoundingMode.HALF_UP);
                iva = total.subtract(neto);
            }
            
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
    
    @PostMapping("/generar")
    public ResponseEntity<Map<String, Object>> generarFactura(@RequestBody Map<String, Object> request) {
        try {
            if (request.get("estadiaId") == null) throw new ValidacionException("Falta ID de estadía");
            if (request.get("responsableId") == null) throw new ValidacionException("Falta ID del responsable de pago");
            if (request.get("itemsSeleccionados") == null) throw new ValidacionException("Faltan items seleccionados");
            if (request.get("horaSalida") == null) throw new ValidacionException("Falta hora de salida confirmada");

            Integer estadiaId = Integer.parseInt(request.get("estadiaId").toString());
            Integer responsableId = Integer.parseInt(request.get("responsableId").toString());
            LocalDateTime horaSalida = LocalDateTime.parse(request.get("horaSalida").toString(), formatter);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsSeleccionados = (List<Map<String, Object>>) request.get("itemsSeleccionados");
            
            if (itemsSeleccionados.isEmpty()) throw new ValidacionException("Debe seleccionar al menos un ítem");
            
            Estadia estadia = facturacionService.obtenerEstadia(estadiaId);
            ResponsableDePago responsable = facturacionService.obtenerResponsable(responsableId);
            
            Factura factura = facturacionService.generarFactura(estadia, responsable, itemsSeleccionados, horaSalida);
            
            Map<String, Object> facturaData = new HashMap<>();
            facturaData.put("id", factura.getId());
            facturaData.put("numero", factura.getId());
            facturaData.put("monto", factura.getMonto());
            facturaData.put("tipo", factura.getTipo());
            facturaData.put("estado", factura.getEstado());
            facturaData.put("fecha", LocalDateTime.now());
            facturaData.put("habitacion", estadia.getHabitacion().getNumero());
            
            if (responsable instanceof PersonaFisica) {
                facturaData.put("clienteTipo", "PERSONA_FISICA");
            } else if (responsable instanceof PersonaJuridica) {
                PersonaJuridica pj = (PersonaJuridica) responsable;
                facturaData.put("clienteTipo", "PERSONA_JURIDICA");
                // USO DE CAMELCASE CORRECTO
                facturaData.put("razonSocial", pj.getRazonSocial()); 
                facturaData.put("cuit", pj.getCuit());
            }
            
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

            Map<String, Object> data = new HashMap<>();
            data.put("factura", facturaData);

            response.put("data", data);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/facturas-pendientes/{habitacionId}")
    public ResponseEntity<Map<String, Object>> obtenerFacturasPendientes(@PathVariable Integer habitacionId) {
        try {
            List<Estadia> estadias = estadiaRepository.findByHabitacionId(habitacionId);
            List<Map<String, Object>> facturasPendientes = new ArrayList<>();
            
            for (Estadia estadia : estadias) {
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
    
    private String determinarTipoFacturaPreliminar(String tipoResponsable, String posicionIVA) {
        if ("JURIDICA".equals(tipoResponsable)) return "A";
        if ("FISICA".equals(tipoResponsable) && 
            "RESPONSABLE_INSCRIPTO".equalsIgnoreCase(posicionIVA)) return "A";
        return "B";
    }
}