package com.example.demo.servicios;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    @Transactional
    public Estadia crearEstadia(CrearEstadiaRequest request) throws Exception {

        // 1. Validar Habitación
        Habitacion habitacion = habitacionRepositorio.findById(request.getIdHabitacion())
                .orElseThrow(() -> new Exception("Habitación no encontrada con ID: " + request.getIdHabitacion()));

        if (habitacion.getEstado() == EstadoHabitacion.OCUPADA) {
            throw new ValidacionException("La habitación " + habitacion.getNumero() + " ya está OCUPADA. No se puede realizar el check-in.");
        }
        if (habitacion.getEstado() == EstadoHabitacion.FUERA_DE_SERVICIO) {
            throw new ValidacionException("La habitación " + habitacion.getNumero() + " está FUERA DE SERVICIO.");
        }

        // 2. Validar Titular
        Integer idTitular = request.getIdHuespedTitular(); 
        Huesped huespedTitular = huespedRepositorio.findById(idTitular)
                .orElseThrow(() -> new Exception("Huésped titular no encontrado"));
        
        // 3. Validar Acompañantes
        List<Huesped> acompanantes = new ArrayList<>();
        if (request.getIdHuespedesAcompanantes() != null) {
            for(Integer id : request.getIdHuespedesAcompanantes()) {
                if (!id.equals(idTitular)) { // Evitar duplicar titular como acompañante
                    acompanantes.add(huespedRepositorio.findById(id)
                        .orElseThrow(() -> new Exception("Acompañante ID " + id + " no encontrado")));
                }
            }
        }

        // 4. Validar reserva
        if (request.getIdReserva() != null) {
            Reserva reserva = reservaRepositorio.findById(request.getIdReserva())
                    .orElseThrow(() -> new ValidacionException("La reserva indicada no existe."));
            
            // Validamos que la reserva corresponda a la habitación que estamos ocupando
            if (!reserva.getHabitacion().getId().equals(habitacion.getId())) {
                throw new ValidacionException("Error: La reserva seleccionada corresponde a la habitación " 
                    + reserva.getHabitacion().getNumero() + ", no a la " + habitacion.getNumero());
            }
            // Validamos que la reserva no esté cancelada
            if (reserva.getEstado() == EstadoReserva.CANCELADA) {
                throw new ValidacionException("La reserva seleccionada se encuentra CANCELADA.");
            }
        }
        // NOTA: Si es NULL, es un Walk-in y el sistema permite continuar (Ocupar Igual).

        // 5. Crear Estadia
        Estadia estadia = new Estadia();
        estadia.setHabitacion(habitacion);
        estadia.setHuesped(huespedTitular);

        // --- FECHAS Y HORARIOS ---
        // Check-in: Ahora mismo
        estadia.setCheckIn(LocalDateTime.now());
        
        // Check-out: Fecha calculada + 10:00 AM Fijo 
        LocalDateTime fechaSalida = LocalDateTime.now().plusDays(request.getCantidadDias());
        estadia.setCheckOut(fechaSalida.with(LocalTime.of(10, 0))); // 10:00 hs

        estadia.setCantidadDias(request.getCantidadDias());
        estadia.setCantidadHuespedes(1 + acompanantes.size());
        estadia.setCantidadHabitaciones(1);

        // Si viene de reserva, la vinculamos
        if (request.getIdReserva() != null) {
             estadia.setIdReserva(request.getIdReserva());
        }

        
        // 6. Actualizar Estado Habitación a OCUPADA
        habitacion.setEstado(EstadoHabitacion.OCUPADA);
        habitacionRepositorio.save(habitacion);

        Estadia estadiaGuardada = estadiaRepositorio.save(estadia);

        // 7. Actualizar titular y acompañantes
        huespedTitular.setEstadia(estadiaGuardada);
        huespedRepositorio.save(huespedTitular);

        for (Huesped a : acompanantes) {
            a.setEstadia(estadiaGuardada);
            huespedRepositorio.save(a);
        }

        return estadiaGuardada;
    }

    // Para el CU11: Verificar si un huésped se alojó antes
    public boolean huespedSeHaAlojado(Integer idHuesped) { 
        List<Estadia> estadias = estadiaRepositorio.findByHuespedID(idHuesped);
        System.out.println("Huésped ID " + idHuesped + " tiene " + estadias.size() + " estadías anteriores");
        return !estadias.isEmpty();
    }

    public Optional<Estadia> buscarEstadiaActivaPorHabitacion(Integer idHabitacion) {
        // Llama a la query personalizada del repositorio
        return estadiaRepositorio.findByHabitacionIdAndOcupada(idHabitacion);
    }
}

