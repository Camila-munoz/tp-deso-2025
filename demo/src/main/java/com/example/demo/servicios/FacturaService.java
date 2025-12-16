package com.example.demo.servicios;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.*;
import com.example.demo.repositorios.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
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
    private FacturaRepositorio facturaRepository;
    
    @Autowired
    private ResponsableDePagoRepository responsableRepository;
    
    @Autowired
    private HabitacionRepositorio habitacionRepository;

    @PersistenceContext
    private EntityManager entityManager;
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    private BigDecimal convertirABigDecimal(Object valor) {
        if (valor == null) return BigDecimal.ZERO;
        if (valor instanceof BigDecimal) return (BigDecimal) valor;
        if (valor instanceof Integer) return BigDecimal.valueOf((Integer) valor);
        if (valor instanceof Long) return BigDecimal.valueOf((Long) valor);
        if (valor instanceof Double) return BigDecimal.valueOf((Double) valor);
        if (valor instanceof String) return new BigDecimal((String) valor);
        return new BigDecimal(valor.toString());
    }

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
        return ChronoUnit.YEARS.between(huesped.getFechaNacimiento().atStartOfDay(), ahora) >= 18;
    }
    
    private Optional<PersonaJuridica> buscarPersonaJuridicaPorCuit(String cuit) {
        try {
            TypedQuery<PersonaJuridica> query = entityManager.createQuery(
                "SELECT p FROM PersonaJuridica p WHERE p.cuit = :cuit", PersonaJuridica.class);
            query.setParameter("cuit", cuit);
            return query.getResultStream().findFirst();
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    private Optional<PersonaFisica> buscarPersonaFisicaPorHuesped(Integer idHuesped) {
        try {
            TypedQuery<PersonaFisica> query = entityManager.createQuery(
                "SELECT p FROM PersonaFisica p WHERE p.idHuesped = :idHuesped", PersonaFisica.class);
            query.setParameter("idHuesped", idHuesped);
            return query.getResultStream().findFirst();
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    // ==================== CU07 - VALIDACIONES ====================
    
    @Transactional(readOnly = true)
    public Map<String, Object> validarDatosFacturacion(Integer numeroHabitacion, LocalDateTime horaSalida) 
            throws ValidacionException {
        Map<String, Object> resultado = new HashMap<>();
        List<String> errores = new ArrayList<>();
        
        if (numeroHabitacion == null) errores.add("Número de habitación faltante");
        if (horaSalida == null) errores.add("Hora de salida faltante");
        else if (horaSalida.isAfter(LocalDateTime.now().plusDays(1))) errores.add("Hora de salida incorrecta");
        
        if (!errores.isEmpty()) throw new ValidacionException("Errores: " + String.join(", ", errores));
        
        Habitacion habitacion = habitacionRepository.findById(numeroHabitacion)
                .orElseThrow(() -> new ValidacionException("Habitación no encontrada"));
        Estadia estadia = estadiaRepository.findEstadiaActivaByHabitacion(numeroHabitacion)
                .orElseThrow(() -> new ValidacionException("Habitación no ocupada"));
        
        if (horaSalida.isBefore(estadia.getCheckIn())) 
            throw new ValidacionException("Hora de salida anterior al check-in");
        
        List<Huesped> huespedes = new ArrayList<>();
        huespedes.add(estadia.getHuesped());
        
        resultado.put("estadia", estadia);
        resultado.put("huespedes", huespedes);
        resultado.put("habitacion", habitacion);
        
        return resultado;
    }
    
    @Transactional
    public Map<String, Object> validarResponsable(Integer idHuesped, String cuitTercero) 
            throws ValidacionException, EntidadNoEncontradaException {
        Map<String, Object> resultado = new HashMap<>();
        
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
            resultado.put("razonSocial", pj.getRazonSocial());
            resultado.put("cuit", pj.getCuit());
            resultado.put("posicionIVA", "Responsable Inscripto");
            return resultado;
        }
        
        if (idHuesped == null) throw new ValidacionException("Debe seleccionar un huésped");
        
        Huesped huesped = huespedRepository.findById(idHuesped)
                .orElseThrow(() -> new EntidadNoEncontradaException("Huésped no encontrado"));
        
        if (!esMayorDeEdad(huesped)) throw new ValidacionException("Huésped menor de edad");
        
        PersonaFisica personaFisica;
        Optional<PersonaFisica> pfOpt = buscarPersonaFisicaPorHuesped(idHuesped);
        
        if (pfOpt.isPresent()) {
            personaFisica = pfOpt.get();
        } else {
            personaFisica = new PersonaFisica();
            personaFisica.setIdHuesped(huesped.getId());
            personaFisica = responsableRepository.save(personaFisica);
        }
        
        resultado.put("tipo", "FISICA");
        resultado.put("responsable", personaFisica); 
        resultado.put("huesped", huesped);
        resultado.put("nombreCompleto", huesped.getApellido() + ", " + huesped.getNombre());
        resultado.put("posicionIVA", huesped.getPosicionIVA());
        resultado.put("cuit", huesped.getCuit());
        
        return resultado;
    }
    
    // ==================== CU07 - CÁLCULOS ====================
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> calcularItemsFacturables(Estadia estadia, LocalDateTime horaSalida) {
        List<Map<String, Object>> items = new ArrayList<>();
        BigDecimal costoEstadia = calcularCostoEstadiaConReglas(estadia, horaSalida);
        
        Map<String, Object> itemEstadia = new HashMap<>();
        itemEstadia.put("tipo", "ESTADIA");
        itemEstadia.put("descripcion", "Estadía Habitación Nº " + estadia.getHabitacion().getNumero());
        itemEstadia.put("monto", costoEstadia);
        itemEstadia.put("seleccionado", true);
        items.add(itemEstadia);
        
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
        LocalDateTime checkInAjustado = checkIn.withHour(12).withMinute(0).withSecond(0);
        if (checkIn.isAfter(checkInAjustado)) checkInAjustado = checkIn;
        LocalDateTime checkOutBase = horaSalida.toLocalDate().atTime(10, 0);
        
        long diasCompletos = ChronoUnit.DAYS.between(checkInAjustado.toLocalDate(), checkOutBase.toLocalDate());
        BigDecimal costo = costoPorNoche.multiply(BigDecimal.valueOf(Math.max(0, diasCompletos)));
        
        LocalDateTime onceUna = horaSalida.toLocalDate().atTime(11, 1);
        LocalDateTime seisPm = horaSalida.toLocalDate().atTime(18, 0);
        
        if (horaSalida.isAfter(onceUna) && horaSalida.isBefore(seisPm)) {
            costo = costo.add(costoPorNoche.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP));
        } else if (horaSalida.isAfter(seisPm)) {
            costo = costo.add(costoPorNoche);
        }
        return costo;
    }
    
    // ==================== CU07 - GENERACIÓN ====================
    
    @Transactional
    public Factura generarFactura(Estadia estadia, ResponsableDePago responsable, 
                                  List<Map<String, Object>> itemsSeleccionados,
                                  LocalDateTime horaSalida) 
            throws ValidacionException {
        
        if (itemsSeleccionados == null || itemsSeleccionados.isEmpty()) 
            throw new ValidacionException("Seleccione ítems");
        
        BigDecimal total = BigDecimal.ZERO;
        boolean incluyeEstadia = false;

        for (Map<String, Object> item : itemsSeleccionados) {
        Boolean seleccionado = (Boolean) item.get("seleccionado");
        if (seleccionado != null && seleccionado) {
            BigDecimal monto = convertirABigDecimal(item.get("monto"));
            if (monto != null) total = total.add(monto);
            
            // Verificamos si se está facturando la estadía
            String tipo = (String) item.get("tipo");
            if ("ESTADIA".equals(tipo)) {
                incluyeEstadia = true;
            }
        }
    }
        
        if (total.compareTo(BigDecimal.ZERO) <= 0) 
            throw new ValidacionException("Monto total inválido");
        
        String tipoFactura = determinarTipoFactura(responsable);
        
        Factura factura = new Factura();
        factura.setMonto(total); 
        factura.setTipo(tipoFactura);
        factura.setEstado(EstadoFactura.PENDIENTE);
        factura.setEstadia(estadia);
        factura.setResponsable(responsable);
        
        
        if (incluyeEstadia || estadia.getCheckOut() == null) {
            estadia.setCheckOut(horaSalida);
            estadiaRepository.save(estadia);
        }
        
        return facturaRepository.save(factura);
    }
    
    private String determinarTipoFactura(ResponsableDePago responsable) {
        if (responsable instanceof PersonaJuridica) {
            PersonaJuridica pj = (PersonaJuridica) responsable;
            if (pj.getCuit() != null && !pj.getCuit().trim().isEmpty()) return "A";
        } else if (responsable instanceof PersonaFisica) {
            PersonaFisica pf = (PersonaFisica) responsable;
            // VALIDACIÓN DE NULOS CRÍTICA:
            if (pf.getIdHuesped() != null) {
                Optional<Huesped> hOpt = huespedRepository.findById(pf.getIdHuesped());
                if (hOpt.isPresent()) {
                    Huesped h = hOpt.get();
                    if (h.getCuit() != null && !h.getCuit().trim().isEmpty() &&
                        ("RESPONSABLE_INSCRIPTO".equalsIgnoreCase(h.getPosicionIVA()) ||
                         "RESPONSABLE_INSCRIPTO".equals(h.getPosicionIVA()))) {
                        return "A";
                    }
                }
            }
        }
        return "B";
    }
}