package com.example.demo.servicios;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.modelo.*;
import com.example.demo.repositorios.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservaService {

    @Autowired private ReservaRepositorio reservaRepositorio;
    @Autowired private HabitacionRepositorio habitacionRepositorio;
    @Autowired private HuespedRepositorio huespedRepositorio;

    // --- CU04: RESERVAR HABITACIÓN ---
    @Transactional
    public Reserva crearReserva(LocalDate fEntrada, LocalDate fSalida, Long idHuesped, List<Long> idsHabitaciones) 
            throws ValidacionException, EntidadNoEncontradaException {
        
        // 1. Validar Fechas
        if (fEntrada.isAfter(fSalida)) {
            throw new ValidacionException("La fecha de entrada no puede ser posterior a la de salida.");
        }
        if (fEntrada.isBefore(LocalDate.now())) {
            throw new ValidacionException("No se puede reservar en el pasado.");
        }

        // 2. Buscar Huésped
        Huesped huesped = huespedRepositorio.findById(idHuesped)
                .orElseThrow(() -> new EntidadNoEncontradaException("Huésped no encontrado"));

        // 3. Buscar Habitaciones
        List<Habitacion> habitaciones = habitacionRepositorio.findAllById(idsHabitaciones);
        if (habitaciones.isEmpty() || habitaciones.size() != idsHabitaciones.size()) {
            throw new ValidacionException("Alguna de las habitaciones no existe.");
        }

        // 4. Validación de disponibilidad
        for (Habitacion h : habitaciones) {
            List<Reserva> conflictos = reservaRepositorio.findByHabitacionesIdAndFechaSalidaAfterAndFechaEntradaBeforeAndEstadoNot(
                    h.getId(), 
                    fEntrada, // Si mi reserva empieza antes de que la otra termine...
                    fSalida,  // Y termina después de que la otra empiece...
                    EstadoReserva.CANCELADA // Ignoramos las canceladas
            );
            
            if (!conflictos.isEmpty()) {
                throw new ValidacionException("La habitación " + h.getNumero() + " ya está ocupada en esas fechas.");
            }
        }

        // 5. Crear y Guardar
        Reserva reserva = new Reserva();
        reserva.setFechaEntrada(fEntrada);
        reserva.setFechaSalida(fSalida);
        reserva.setHuesped(huesped);
        reserva.setHabitaciones(habitaciones);
        reserva.setEstado(EstadoReserva.CONFIRMADA); 

        return reservaRepositorio.save(reserva);
    }

    // --- CU06: CANCELAR RESERVA ---
    public void cancelarReserva(Long idReserva) throws EntidadNoEncontradaException {
        Reserva reserva = reservaRepositorio.findById(idReserva)
                .orElseThrow(() -> new EntidadNoEncontradaException("Reserva no encontrada"));
        
        reserva.setEstado(EstadoReserva.CANCELADA);
        reservaRepositorio.save(reserva);
    }
    
    public List<Reserva> buscarPorApellido(String apellido) {
        return reservaRepositorio.findByHuespedApellidoContainingIgnoreCase(apellido);
    }
}