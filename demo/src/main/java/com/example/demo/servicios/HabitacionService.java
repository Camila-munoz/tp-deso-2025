package com.example.demo.servicios;

import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.Reserva;
import com.example.demo.modelo.EstadoHabitacion;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.ReservaRepositorio; // Necesario para buscar conflictos
import com.example.demo.excepciones.ValidacionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    /**
     * CU05: Muestra el estado de todas las habitaciones para un rango de fechas.
     * @return Mapa donde la clave es la Habitación y el valor es el estado para el rango.
     */
    public Map<Integer, EstadoHabitacion> mostrarEstadoHabitaciones(LocalDate fechaDesde, LocalDate fechaHasta) throws ValidacionException {
        
        if (fechaDesde == null) {
        throw new ValidacionException("El campo 'fechaDesde' es obligatorio.");
        }
        if (fechaHasta == null) {
        throw new ValidacionException("El campo 'fechaHasta' es obligatorio.");
        }
    
        // Validaciones lógicas ya existentes:
        if (fechaDesde.isAfter(fechaHasta)) {
        throw new ValidacionException("La fecha inicial no puede ser posterior a la fecha final.");
        }
        
        // 1. Obtener todas las habitaciones.
        List<Habitacion> todasHabitaciones = habitacionRepositorio.findAll();
        
        // 2. Obtener los IDs de todas las habitaciones para la consulta de conflictos.
        List<Integer> todosIds = todasHabitaciones.stream()
            .map(Habitacion::getId)
            .collect(Collectors.toList());

        // 3. Buscar todas las reservas que se solapan en ese rango (Usando el método de ReservaRepositorio).
        List<Reserva> reservasConflictivas = reservaRepositorio.findReservasConflictivas(
            todosIds, 
            fechaDesde, 
            fechaHasta
        );
        
        // 4. Crear mapa de resultados (ID de Habitación -> Estado)
        Map<Integer, EstadoHabitacion> estadoFinal = todasHabitaciones.stream()
            .collect(Collectors.toMap(Habitacion::getId, Habitacion::getEstado));

        // 5. Aplicar estados temporales basados en las reservas.
        // Itera sobre las habitaciones y verifica si alguna está reservada o ya ocupada
        for (Habitacion hab : todasHabitaciones) {
            // Estado inicial de la BD (OCUPADA/FUERA_DE_SERVICIO) tiene prioridad.
            if (hab.getEstado() == EstadoHabitacion.OCUPADA || hab.getEstado() == EstadoHabitacion.FUERA_DE_SERVICIO) {
                // Si ya está ocupada o fuera de servicio, su estado es definitivo.
                continue; 
            }
            
            // Si no está ocupada, verificamos si está reservada en el rango.
            boolean estaReservada = reservasConflictivas.stream()
                .anyMatch(reserva -> reserva.getHabitaciones().contains(hab));

            if (estaReservada) {
                estadoFinal.put(hab.getId(), EstadoHabitacion.RESERVADA);
            } else {
                estadoFinal.put(hab.getId(), EstadoHabitacion.LIBRE);
            }
        }
        
        return estadoFinal;
    }
}