package com.example.demo.servicios;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.modelo.Estadia;
import com.example.demo.modelo.EstadoHabitacion;
import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.Huesped;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.HuespedRepositorio;

@Service
public class EstadiaService {
    
    @Autowired
    private EstadiaRepositorio estadiaRepositorio;

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;

    @Autowired
    private HuespedRepositorio huespedRepositorio;


    @Transactional
    public Estadia crearEstadia(Integer idHabitacion, Integer idHuesped) throws Exception {

        // 1. Buscar entidades
        Habitacion habitacion = habitacionRepositorio.findById(idHabitacion)
                .orElseThrow(() -> new Exception("Habitacion no encontrada"));

        Huesped huesped = huespedRepositorio.findById(idHuesped)
                .orElseThrow(() -> new Exception("Huesped no encontrado"));
        
        // 2. Validar disponibilidad
        if (habitacion.getEstado() != EstadoHabitacion.LIBRE && habitacion.getEstado() != EstadoHabitacion.RESERVADA) {
            throw new Exception("La habitación no está disponible para ocuparse.");
        }

        // 3. Crear la estadía
        Estadia estadia = new Estadia();
        estadia.setHabitaciones(habitacion);
        estadia.setHuespedes(huesped);
        estadia.setCheckIn(LocalDateTime.now());
        
        // 4. Actualizar estado de la habitación a OCUPADA
        habitacion.setEstado(EstadoHabitacion.OCUPADA);
        habitacionRepositorio.save(habitacion);

        return estadiaRepositorio.save(estadia);

    }

    // Para el CU11: Verificar si un huésped se alojó antes
    public boolean huespedSeHaAlojado(Integer idHuesped) { 
        return !estadiaRepositorio.findByHuespedID(idHuesped).isEmpty();
    }
}
