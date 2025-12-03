package com.example.demo.servicios;

import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.Reserva;
import com.example.demo.modelo.EstadoHabitacion;
import com.example.demo.modelo.Estadia;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.ReservaRepositorio;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.excepciones.ValidacionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HabitacionService {

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;
    
    @Autowired
    private ReservaRepositorio reservaRepositorio;

    @Autowired
    private EstadiaRepositorio estadiaRepositorio;

    /**
     * CU05: Muestra el estado de todas las habitaciones para un rango de fechas.
     * @return Mapa donde la clave es la Habitación y el valor es el estado para el rango.
     */
    public List<Map<String, Object>> mostrarEstadoHabitaciones(LocalDate fechaDesde, LocalDate fechaHasta) throws ValidacionException {
        if (fechaDesde == null || fechaHasta == null) throw new ValidacionException("Fechas obligatorias.");

        List<Habitacion> todas = habitacionRepositorio.findAll();
        List<Map<String, Object>> grilla = new ArrayList<>();

        // Convertimos LocalDate a LocalDateTime para buscar estadías
        LocalDateTime inicioDia = fechaDesde.atStartOfDay();
        LocalDateTime finDia = fechaHasta.atTime(LocalTime.MAX);

        // Iteramos por cada habitación
        for (Habitacion hab : todas) {
            
            // 1. Buscamos Reservas (Amarillo)
            List<Reserva> reservas = reservaRepositorio.findReservasConflictivas(hab.getId(), fechaDesde, fechaHasta);
            
            // 2. Buscamos Estadías (Rojo)
            List<Estadia> estadias = estadiaRepositorio.findEstadiasConflictivas(hab.getId(), inicioDia, finDia);

            LocalDate diaActual = fechaDesde;
            
            while (!diaActual.isAfter(fechaHasta)) {
                
                EstadoHabitacion estadoDia = EstadoHabitacion.LIBRE;

                // A. Prioridad 1: FUERA DE SERVICIO
                if (hab.getEstado() == EstadoHabitacion.FUERA_DE_SERVICIO) {
                    estadoDia = EstadoHabitacion.FUERA_DE_SERVICIO;
                } else {
                    
                    // B. Prioridad 2: OCUPADA (Estadía Activa)
                    for (Estadia e : estadias) {
                        LocalDate in = e.getCheckIn().toLocalDate();
                        LocalDate out = e.getCheckOut().toLocalDate();
                        
                        // Si el día cae dentro de la estadía (Inclusive checkin, exclusive checkout)
                        if (!diaActual.isBefore(in) && diaActual.isBefore(out)) {
                            estadoDia = EstadoHabitacion.OCUPADA;
                            break;
                        }
                    }

                    // C. Prioridad 3: RESERVADA (Solo si no está ocupada)
                    if (estadoDia == EstadoHabitacion.LIBRE) {
                        for (Reserva r : reservas) {
                            if (!diaActual.isBefore(r.getFechaEntrada()) && !diaActual.isAfter(r.getFechaSalida())) {
                                estadoDia = EstadoHabitacion.RESERVADA;
                                break;
                            }
                        }
                    }
                }

                Map<String, Object> celda = new HashMap<>();
                celda.put("idHabitacion", hab.getId());
                celda.put("fecha", diaActual.toString());
                celda.put("estado", estadoDia);
                grilla.add(celda);

                diaActual = diaActual.plusDays(1);
            }
        }
        return grilla;
    }
}