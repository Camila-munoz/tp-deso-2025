// FacturacionService.java (sin DTOs)
package com.example.demo.servicios;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.*;
import com.example.demo.repositorios.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class FacturaService {

    @Autowired
    private EstadiaRepositorio estadiaRepository;
    
    @Autowired
    private HuespedRepositorio huespedRepository;
    
    @Autowired
    private ConsumoRepositorio consumoRepository;
    
    @Autowired
    private FacturaRepositorio facturaRepository;
    
    @Autowired
    private ResponsableDePagoRepository responsableRepository;
    
    @Autowired
    private HabitacionRepositorio habitacionRepository;
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    public Estadia obtenerEstadia(Integer id) throws EntidadNoEncontradaException {
        return estadiaRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Estadía no encontrada con ID: " + id));
    }
    
    public ResponsableDePago obtenerResponsable(Integer id) throws EntidadNoEncontradaException {
        return responsableRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Responsable no encontrado con ID: " + id));
    }
    
    private boolean esMayorDeEdad(Huesped huesped) {
        if (huesped.getFechaNacimiento() == null) {
            return huesped.getEdad() != null && huesped.getEdad() >= 18;
        }
        
        LocalDateTime ahora = LocalDateTime.now();
        long edad = ChronoUnit.YEARS.between(
            huesped.getFechaNacimiento().atStartOfDay(), 
            ahora
        );
        return edad >= 18;
    }
    
    private Optional<PersonaJuridica> buscarPersonaJuridicaPorCuit(String cuit) {
        // Implementación real dependería de tu repositorio
        return Optional.empty();
    }
    
    private PersonaFisica convertirHuespedAPersonaFisica(Huesped huesped) {
        PersonaFisica pf = new PersonaFisica();
        pf.setIdHuesped(huesped.getId());
        pf.setCuit(huesped.getCuit());
        pf.setPosicionIVA(huesped.getPosicionIVA());
        pf.setFechaNacimiento(huesped.getFechaNacimiento());
        return pf;
    }
    
    // ==================== CU07 - PASO 1-3 ====================
    
    @Transactional(readOnly = true)
    public Map<String, Object> validarDatosFacturacion(Integer numeroHabitacion, LocalDateTime horaSalida) 
            throws ValidacionException {
        
        Map<String, Object> resultado = new HashMap<>();
        List<String> errores = new ArrayList<>();
        
        // FA 3.A: Validaciones
        if (numeroHabitacion == null) {
            errores.add("Número de habitación faltante");
        }
        
        if (horaSalida == null) {
            errores.add("Hora de salida faltante");
        } else if (horaSalida.isAfter(LocalDateTime.now().plusDays(1))) {
            errores.add("Hora de salida no puede ser más de 24 horas en el futuro");
        }
        
        if (!errores.isEmpty()) {
            throw new ValidacionException("Errores de validación: " + String.join(", ", errores));
        }
        
        // Buscar habitación
        Habitacion habitacion = habitacionRepository.findById(numeroHabitacion)
                .orElseThrow(() -> new ValidacionException("Habitación no encontrada"));
        
        // Buscar estadía activa
        Estadia estadia = estadiaRepository.findEstadiaActivaByHabitacion(numeroHabitacion)
                .orElseThrow(() -> new ValidacionException("Habitación no ocupada"));
        
        if (horaSalida.isBefore(estadia.getCheckIn())) {
            throw new ValidacionException("Hora de salida no puede ser anterior al check-in");
        }
        
        // Obtener huésped (en tu modelo, una estadía tiene un huésped)
        List<Huesped> huespedes = new ArrayList<>();
        huespedes.add(estadia.getHuesped());
        
        resultado.put("estadia", estadia);
        resultado.put("huespedes", huespedes);
        resultado.put("habitacion", habitacion);
        
        return resultado;
    }
    
    // ==================== CU07 - PASO 4-5 ====================
    
    @Transactional(readOnly = true)
    public Map<String, Object> validarResponsable(Integer idHuesped, String cuitTercero) 
            throws ValidacionException, EntidadNoEncontradaException {
        
        Map<String, Object> resultado = new HashMap<>();
        
        // FA 5.B: Factura a tercero
        if (cuitTercero != null && !cuitTercero.trim().isEmpty()) {
            Optional<PersonaJuridica> pjOpt = buscarPersonaJuridicaPorCuit(cuitTercero);
            
            if (pjOpt.isEmpty()) {
                resultado.put("needsCU03", true);
                resultado.put("cuit", cuitTercero);
                return resultado;
            }
            
            PersonaJuridica pj = pjOpt.get();
            resultado.put("tipo", "JURIDICA");
            resultado.put("responsable", pj);
            resultado.put("razonSocial", pj.getRazon_Social());
            resultado.put("cuit", pj.getCuit());
            resultado.put("posicionIVA", "Responsable Inscripto");
            
            return resultado;
        }
        
        // Responsable persona física
        if (idHuesped == null) {
            throw new ValidacionException("Debe seleccionar un huésped o ingresar CUIT de tercero");
        }
        
        Huesped huesped = huespedRepository.findById(idHuesped)
                .orElseThrow(() -> new EntidadNoEncontradaException("Huésped no encontrado"));
        
        // FA 5.A: Validar mayoría de edad
        if (!esMayorDeEdad(huesped)) {
            throw new ValidacionException("La persona seleccionada es menor de edad. Por favor elija otra");
        }
        
        PersonaFisica personaFisica = convertirHuespedAPersonaFisica(huesped);
        
        resultado.put("tipo", "FISICA");
        resultado.put("responsable", personaFisica);
        resultado.put("huesped", huesped);
        resultado.put("nombreCompleto", huesped.getApellido() + ", " + huesped.getNombre());
        resultado.put("posicionIVA", huesped.getPosicionIVA());
        resultado.put("cuit", huesped.getCuit());
        
        return resultado;
    }
    
    // ==================== CU07 - PASO 6 ====================
    
    @Transactional(readOnly = true)
    // En FacturacionService.java - método calcularItemsFacturables
public List<Map<String, Object>> calcularItemsFacturables(Estadia estadia, LocalDateTime horaSalida) {
    List<Map<String, Object>> items = new ArrayList<>();
    
    // 1. Costo de estadía
    BigDecimal costoEstadia = calcularCostoEstadiaConReglas(estadia, horaSalida);
    
    Map<String, Object> itemEstadia = new HashMap<>();
    itemEstadia.put("tipo", "ESTADIA");
    itemEstadia.put("descripcion", "Estadía en habitación " + estadia.getHabitacion().getNumero() + 
                     " (" + estadia.getCantidadDias() + " días)");
    itemEstadia.put("monto", costoEstadia);
    itemEstadia.put("seleccionado", true);
    items.add(itemEstadia);
    
    // 2. Consumos (todos los consumos de la estadía)
    // Cambiar de: consumoRepository.findByEstadiaId(estadia.getId());
    // A: estadiaRepository.findConsumosByEstadiaId(estadia.getId());
    List<Consumo> consumos = estadiaRepository.findConsumosByEstadiaId(estadia.getId());
    for (Consumo consumo : consumos) {
        Map<String, Object> itemConsumo = new HashMap<>();
        itemConsumo.put("tipo", "CONSUMO");
        itemConsumo.put("descripcion", consumo.getDescripcion());
        itemConsumo.put("monto", consumo.getPrecio());
        itemConsumo.put("seleccionado", true);
        items.add(itemConsumo);
    }
    
    return items;
}
    
    private BigDecimal calcularCostoEstadiaConReglas(Estadia estadia, LocalDateTime horaSalida) {
        BigDecimal costoPorNoche = estadia.getHabitacion().getCosto();
        LocalDateTime checkIn = estadia.getCheckIn();
        
        // Regla 6: Check-in a las 12:00 pm
        LocalDateTime checkInAjustado = checkIn.withHour(12).withMinute(0).withSecond(0);
        if (checkIn.isAfter(checkInAjustado)) {
            checkInAjustado = checkIn;
        }
        
        // Regla 7: Check-out a las 10:00 am
        LocalDateTime checkOutBase = horaSalida.toLocalDate().atTime(10, 0);
        
        // Calcular días completos
        long diasCompletos = ChronoUnit.DAYS.between(
            checkInAjustado.toLocalDate(), 
            checkOutBase.toLocalDate()
        );
        
        BigDecimal costoDiasCompletos = costoPorNoche.multiply(BigDecimal.valueOf(Math.max(0, diasCompletos)));
        
        // Regla 8: Entre 11:01 y 18:00 -> 50%
        LocalDateTime onceUna = horaSalida.toLocalDate().atTime(11, 1);
        LocalDateTime seisPm = horaSalida.toLocalDate().atTime(18, 0);
        
        if (horaSalida.isAfter(onceUna) && horaSalida.isBefore(seisPm)) {
            BigDecimal medioDia = costoPorNoche.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            return costoDiasCompletos.add(medioDia);
        }
        
        // Regla 9: Después de 18:00 -> día completo
        if (horaSalida.isAfter(seisPm)) {
            return costoDiasCompletos.add(costoPorNoche);
        }
        
        return costoDiasCompletos;
    }
    
    // ==================== CU07 - PASO 7-8 ====================
    
    @Transactional
    public Factura generarFactura(Estadia estadia, ResponsableDePago responsable, 
                                  List<Map<String, Object>> itemsSeleccionados) 
            throws ValidacionException {
        
        // FA 9.A: Validar items seleccionados
        if (itemsSeleccionados == null || itemsSeleccionados.isEmpty()) {
            throw new ValidacionException("Debe seleccionar al menos un ítem para facturar");
        }
        
        // Filtrar y calcular total
        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> item : itemsSeleccionados) {
            Boolean seleccionado = (Boolean) item.get("seleccionado");
            if (seleccionado != null && seleccionado) {
                BigDecimal monto = (BigDecimal) item.get("monto");
                if (monto != null) {
                    total = total.add(monto);
                }
            }
        }
        
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidacionException("Debe seleccionar al menos un ítem para facturar");
        }
        
        // Determinar tipo de factura
        String tipoFactura = determinarTipoFactura(responsable);
        
        // Crear factura
        Factura factura = new Factura();
        factura.setMonto(total);
        factura.setTipo(tipoFactura);
        factura.setEstado(EstadoFactura.PENDIENTE);
        factura.setEstadia(estadia);
        factura.setResponsable(responsable);
        
        // Actualizar check-out
        estadia.setCheckOut(LocalDateTime.now());
        
        estadiaRepository.save(estadia);
        return facturaRepository.save(factura);
    }
    
    private String determinarTipoFactura(ResponsableDePago responsable) {
        if (responsable instanceof PersonaJuridica) {
            PersonaJuridica pj = (PersonaJuridica) responsable;
            if (pj.getCuit() != null && !pj.getCuit().trim().isEmpty()) {
                return "A";
            }
        } else if (responsable instanceof PersonaFisica) {
            PersonaFisica pf = (PersonaFisica) responsable;
            if (pf.getCuit() != null && !pf.getCuit().trim().isEmpty() &&
                "Responsable Inscripto".equalsIgnoreCase(pf.getPosicionIVA())) {
                return "A";
            }
        }
        return "B";
    }
}