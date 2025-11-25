package com.example.demo.servicios;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.*;
import com.example.demo.repositorios.*;

@Service
public class EstadiaService {
    
    @Autowired
    private EstadiaRepositorio estadiaRepositorio;

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;

    @Autowired
    private HuespedRepositorio huespedRepositorio;


    @Transactional
    public Estadia crearEstadia(List<Long> idsHabitaciones, List<Long> idsHuespedes) throws Exception {

        // 1. Buscar todas las habitaciones
        List<Habitacion> habitaciones = habitacionRepositorio.findAllById(idsHabitaciones);
        if (habitaciones.size() != idsHabitaciones.size()) {
            throw new ValidacionException("Alguna de las habitaciones no existe.");
        }

        // 2. Validar que estén LIBRES
        for (Habitacion h : habitaciones) {
            // Asumiendo que tienes el enum EstadoHabitacion cargado correctamente o usas String
            if (h.getEstado() != EstadoHabitacion.LIBRE) { 
                throw new ValidacionException("La habitación " + h.getId() + " no está libre.");
            }
        }

        // 3. Buscar todos los huéspedes
        List<Huesped> huespedes = huespedRepositorio.findAllById(idsHuespedes); // Nota: Asegurate que el ID de Huesped sea Integer o Long según corresponda
        if (huespedes.isEmpty()) {
            throw new ValidacionException("Debe haber al menos un huésped.");
        }

        // 4. Crear la estadía y asignar las listas
        Estadia estadia = new Estadia();
        estadia.setHabitaciones(habitaciones);
        estadia.setHuespedes(huespedes);
        estadia.setCheckIn(LocalDateTime.now());
        estadia.setCantidadDias(1); // Valor inicial ejemplo

        // 5. Ocupar las habitaciones
        for (Habitacion h : habitaciones) {
            h.setEstado(EstadoHabitacion.OCUPADA);
        }
        
        habitacionRepositorio.saveAll(habitaciones);

        return estadiaRepositorio.save(estadia);
    }

    // Para el CU11: Verificar si un huésped se alojó antes
    public boolean huespedSeHaAlojado(Long idHuesped) { 
        return !estadiaRepositorio.findByHuespedesId(idHuesped).isEmpty();
    }
}
