package com.example.demo.servicios;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.controladores.EstadiaControlador.CrearEstadiaRequest;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Estadia;
import com.example.demo.modelo.EstadoHabitacion;
import com.example.demo.modelo.EstadoReserva;
import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.Huesped;
import com.example.demo.modelo.Reserva;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.HuespedRepositorio;
import com.example.demo.repositorios.ReservaRepositorio;

@Service
@Transactional
public class EstadiaService {
    
    @Autowired
    private EstadiaRepositorio estadiaRepositorio;

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;

    @Autowired
    private HuespedRepositorio huespedRepositorio;

    @Autowired
    private ReservaRepositorio reservaRepositorio;

    /**
     * CREACIÓN MASIVA (TRANSACCIONAL)
     * Valida todo el paquete antes de guardar nada. Si falla algo, no se guarda nada.
     */
    @Transactional(rollbackFor = Exception.class)
    public List<Estadia> crearEstadiasMasivas(List<CrearEstadiaRequest> requests) throws Exception {
        List<Estadia> estadiasGuardadas = new ArrayList<>();
        
        // SET para controlar que un acompañante no esté repetido en este lote
        Set<Integer> acompanantesEnProceso = new HashSet<>();

        // 1. VALIDACIÓN PREVIA DE TODO EL LOTE
        for (CrearEstadiaRequest req : requests) {
            // A. Validar Titular
            if (!huespedRepositorio.existsById(req.getIdHuespedTitular())) {
                throw new ValidacionException("El titular con ID " + req.getIdHuespedTitular() + " no existe.");
            }

            // B. Validar Acompañantes (Regla de Negocio: Solo en una habitación)
            if (req.getIdHuespedesAcompanantes() != null) {
                for (Integer idAcomp : req.getIdHuespedesAcompanantes()) {
                    // 1. Chequeo dentro del mismo lote
                    if (acompanantesEnProceso.contains(idAcomp)) {
                        Huesped h = huespedRepositorio.findById(idAcomp).orElse(new Huesped());
                        throw new ValidacionException("El acompañante " + h.getApellido() + " " + h.getNombre() + 
                            " no puede estar asignado a múltiples habitaciones a la vez.");
                    }
                    acompanantesEnProceso.add(idAcomp);

                    // 2. Chequeo contra la base de datos
                    if (huespedSeHaAlojadoActualmente(idAcomp)) {
                         Huesped h = huespedRepositorio.findById(idAcomp).get();
                         throw new ValidacionException("El acompañante " + h.getApellido() + " ya se encuentra alojado en el hotel.");
                    }
                }
            }
            
            // C. Validar Disponibilidad de Habitación
            Habitacion hab = habitacionRepositorio.findById(req.getIdHabitacion())
                .orElseThrow(() -> new ValidacionException("Habitación " + req.getIdHabitacion() + " no existe"));
            
            if (hab.getEstado() == EstadoHabitacion.OCUPADA) {
                throw new ValidacionException("La habitación " + hab.getNumero() + " ya figura OCUPADA en el sistema.");
            }
            if (hab.getEstado() == EstadoHabitacion.FUERA_DE_SERVICIO) {
            throw new ValidacionException("La habitación " + hab.getNumero() + " está FUERA DE SERVICIO.");
        }
        }

        // 2. GUARDADO EFECTIVO (Si llegamos acá, todo es válido)
        for (CrearEstadiaRequest req : requests) {
            estadiasGuardadas.add(procesarGuardadoIndividual(req));
        }
        
        return estadiasGuardadas;
    }

    // Lógica interna de guardado
    private Estadia procesarGuardadoIndividual(CrearEstadiaRequest request) throws Exception {
        Habitacion habitacion = habitacionRepositorio.findById(request.getIdHabitacion()).get();
        Huesped titular = huespedRepositorio.findById(request.getIdHuespedTitular()).get();
        
        List<Huesped> listaAcomp = new ArrayList<>();
        if (request.getIdHuespedesAcompanantes() != null) {
            for(Integer id : request.getIdHuespedesAcompanantes()) listaAcomp.add(huespedRepositorio.findById(id).get());
        }

        Estadia estadia = new Estadia();
        estadia.setHabitacion(habitacion);
        estadia.setHuesped(titular);
        estadia.setCheckIn(LocalDateTime.now());
        estadia.setCheckOut(LocalDateTime.now().plusDays(request.getCantidadDias()).with(LocalTime.of(10, 0)));
        estadia.setCantidadDias(request.getCantidadDias());
        estadia.setCantidadHuespedes(1 + listaAcomp.size());
        estadia.setCantidadHabitaciones(1);
        if(request.getIdReserva()!=null) estadia.setIdReserva(request.getIdReserva());

        // Cambiar estado
        habitacion.setEstado(EstadoHabitacion.OCUPADA);
        habitacionRepositorio.save(habitacion);
        
        Estadia guardada = estadiaRepositorio.save(estadia);

        // Actualizar ubicación actual
        titular.setEstadia(guardada);
        huespedRepositorio.save(titular);
        
        for(Huesped a : listaAcomp) {
            a.setEstadia(guardada);
            huespedRepositorio.save(a);
        }
        return guardada;
    }

    // Método auxiliar para saber si está alojado HOY (para validaciones)
    private boolean huespedSeHaAlojadoActualmente(Integer id) {
        // Si el huesped tiene seteada una estadía, es que está dentro
        return huespedRepositorio.findById(id).map(h -> h.getEstadia() != null).orElse(false);
    }

    // --- CU11: Verificar Historial ---
    public boolean huespedSeHaAlojado(Integer id) { 
        return !estadiaRepositorio.findByHuespedID(id).isEmpty();
    }

    public Optional<Estadia> buscarEstadiaActivaPorHabitacion(Integer idHabitacion) {
        // Llama a la query personalizada del repositorio
        return estadiaRepositorio.findByHabitacionIdAndOcupada(idHabitacion);
    }
}

