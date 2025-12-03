package com.example.demo.servicios;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.controladores.ReservaControlador.DetalleReserva;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.EstadoReserva;
import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.Reserva;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.HuespedRepositorio;
import com.example.demo.repositorios.ReservaRepositorio;

@Service
@Transactional
public class ReservaService {

    @Autowired
    private ReservaRepositorio reservaRepositorio;
    @Autowired
    private HabitacionRepositorio habitacionRepositorio;
    @Autowired
    private HuespedRepositorio huespedRepositorio;

    // --- CU04: RESERVAR HABITACIÓN ---
    public List<Reserva> crearReserva(
            List<DetalleReserva> detalles, // Lista con fechas distintas
            String nombre,
            String apellido,
            String telefono  
    ) throws Exception {
        
        // 1. Validaciones
        if (detalles == null || detalles.isEmpty()) throw new ValidacionException("No hay habitaciones seleccionadas.");
        
        if (nombre == null || nombre.trim().isEmpty() || 
            apellido == null || apellido.trim().isEmpty() || 
            telefono == null || telefono.trim().isEmpty()) {
            throw new ValidacionException("Debe completar Nombre, Apellido y Teléfono del eventual huésped.");
        }

        List<Reserva> reservasGeneradas = new ArrayList<>();

       for (DetalleReserva item : detalles) {
            // Validar fechas individuales
            LocalDate fIn = LocalDate.parse(item.getFechaEntrada());
            LocalDate fOut = LocalDate.parse(item.getFechaSalida());

            if (fIn.isAfter(fOut)) throw new ValidacionException("Fechas inválidas para habitación ID " + item.getIdHabitacion());

            Habitacion habitacion = habitacionRepositorio.findById(item.getIdHabitacion())
                .orElseThrow(() -> new Exception("Habitación " + item.getIdHabitacion() + " no encontrada"));

            // Validar Disponibilidad específica para ESTE rango
            List<Reserva> conflictos = reservaRepositorio.findReservasConflictivas(item.getIdHabitacion(), fIn, fOut);
            if (!conflictos.isEmpty()) {
                throw new ValidacionException("La habitación " + habitacion.getNumero() + " no está disponible del " + fIn + " al " + fOut);
            }

            // Crear
            Reserva r = new Reserva();
            r.setFechaEntrada(fIn);
            r.setFechaSalida(fOut);
            r.setEstado(EstadoReserva.CONFIRMADA);
            r.setHabitacion(habitacion);
            
            r.setNombreHuesped(nombre);
            r.setApellidoHuesped(apellido);
            r.setTelefonoHuesped(telefono);

            reservasGeneradas.add(reservaRepositorio.save(r));
        }
        return reservasGeneradas;
    }

    // --- CU06: CANCELAR RESERVA ---
    public List<Reserva> buscarParaCancelar(String apellido) {
        return reservaRepositorio.buscarPorApellido(apellido);
    }

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
}