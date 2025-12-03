package com.example.demo.servicios;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.*;
import com.example.demo.repositorios.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ReservaService {

    @Autowired
    private ReservaRepositorio reservaRepositorio;
    @Autowired
    private HabitacionRepositorio habitacionRepositorio;
    @Autowired
    private HuespedRepositorio huespedRepositorio;

    // --- CU04: RESERVAR HABITACIÓN (Modificado para recibir datos sueltos) ---
    public Reserva crearReserva(LocalDate fechaEntrada, LocalDate fechaSalida, Integer idHuesped, List<Integer> idsHabitaciones) throws Exception {
        
        // 1. Validar Fechas
        if (fechaEntrada == null || fechaSalida == null) {
            throw new ValidacionException("Las fechas son obligatorias.");
        }
        if (fechaEntrada.isAfter(fechaSalida)) {
            throw new ValidacionException("La fecha de entrada no puede ser posterior a la de salida.");
        }
        if (fechaEntrada.isBefore(LocalDate.now())) {
            throw new ValidacionException("No se pueden hacer reservas en el pasado.");
        }

        // 2. Buscar Huésped
        Huesped huesped = huespedRepositorio.findById(idHuesped)
                .orElseThrow(() -> new Exception("Huésped no encontrado con ID: " + idHuesped));

        // 3. Buscar Habitaciones
        if (idsHabitaciones == null || idsHabitaciones.isEmpty()) {
            throw new ValidacionException("Debe seleccionar al menos una habitación.");
        }

        List<Habitacion> habitaciones = habitacionRepositorio.findAllById(idsHabitaciones);
        
        if (habitaciones.size() != idsHabitaciones.size()) {
            throw new Exception("Alguna de las habitaciones solicitadas no existe.");
        }

        // 4. VALIDAR DISPONIBILIDAD
        List<Reserva> conflictos = reservaRepositorio.findReservasConflictivas(
                idsHabitaciones,
                fechaEntrada,
                fechaSalida
        );

        if (!conflictos.isEmpty()) {
            throw new ValidacionException("Una o más habitaciones ya están reservadas en las fechas seleccionadas.");
        }

        // 5. Crear y Guardar Reserva
        Reserva reserva = new Reserva();
        reserva.setFechaEntrada(fechaEntrada);
        reserva.setFechaSalida(fechaSalida);
        reserva.setHuesped(huesped);
        reserva.setHabitaciones(habitaciones);
        reserva.setEstado(EstadoReserva.CONFIRMADA); 

        return reservaRepositorio.save(reserva);
    }

    // --- CU06: CANCELAR RESERVA ---
    public void cancelarReserva(Integer idReserva) throws Exception {
        Reserva reserva = reservaRepositorio.findById(idReserva)
                .orElseThrow(() -> new Exception("Reserva no encontrada con ID: " + idReserva));

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new ValidacionException("La reserva ya estaba cancelada.");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        reservaRepositorio.save(reserva);
    }
    
    public List<Reserva> listarTodas() {
        return reservaRepositorio.findAll();
    }
    // --- NUEVO: Buscar reservas por huésped ---
    public List<Reserva> buscarPorHuesped(Integer idHuesped) {
        return reservaRepositorio.findByHuespedId(idHuesped);
    }

    // --- NUEVO: Cancelar múltiples reservas (opcional) ---
    public int cancelarMultiplesReservas(List<Integer> idsReservas) throws Exception {
        int canceladas = 0;
        
        for (Integer idReserva : idsReservas) {
            try {
                cancelarReserva(idReserva);
                canceladas++;
            } catch (Exception e) {
                // Continuar con las demás reservas
                System.err.println("Error al cancelar reserva " + idReserva + ": " + e.getMessage());
            }
        }
        
        return canceladas;
    }
}