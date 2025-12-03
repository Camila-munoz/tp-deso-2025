package com.example.demo.servicios;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.controladores.EstadiaControlador;
import com.example.demo.modelo.Estadia;
import com.example.demo.modelo.EstadoHabitacion;
import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.Huesped;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.HuespedRepositorio;

@Service
@Transactional
public class EstadiaService {
    
    @Autowired
    private EstadiaRepositorio estadiaRepositorio;

    @Autowired
    private HabitacionRepositorio habitacionRepositorio;

    @Autowired
    private HuespedRepositorio huespedRepositorio;

    @Transactional
    public Estadia crearEstadiaCompleta(EstadiaControlador.CrearEstadiaRequest request) throws Exception {
        System.out.println("🔍 Creando estadía completa con: " + request);

        // 1. Buscar entidades
        Habitacion habitacion = habitacionRepositorio.findById(request.getIdHabitacion())
                .orElseThrow(() -> new Exception("Habitación no encontrada con ID: " + request.getIdHabitacion()));

        Huesped huesped = huespedRepositorio.findById(request.getIdHuesped())
                .orElseThrow(() -> new Exception("Huésped no encontrado con ID: " + request.getIdHuesped()));
        
        System.out.println("✅ Habitación encontrada: " + habitacion.getNumero() + ", Estado: " + habitacion.getEstado());
        System.out.println("✅ Huésped encontrado: " + huesped.getNombre() + " " + huesped.getApellido());

        // 2. Validar disponibilidad
        if (habitacion.getEstado() != EstadoHabitacion.LIBRE && habitacion.getEstado() != EstadoHabitacion.RESERVADA) {
            throw new Exception("La habitación no está disponible para ocuparse. Estado actual: " + habitacion.getEstado());
        }

        // 3. Validar capacidad de la habitación
        if (request.getCantidadHuespedes() > habitacion.getCapacidad()) {
            throw new Exception("La habitación tiene capacidad para " + habitacion.getCapacidad() + 
                              " huéspedes, pero se intentaron asignar " + request.getCantidadHuespedes());
        }

        // 4. Crear la estadía con todos los datos
        Estadia estadia = new Estadia();
        estadia.setHabitacion(habitacion);
        estadia.setHuesped(huesped);
        estadia.setCheckIn(LocalDateTime.now());
        estadia.setCantidadHuespedes(request.getCantidadHuespedes());
        estadia.setCantidadHabitaciones(1); // Por defecto 1 habitación por estadía
        estadia.setCantidadDias(request.getCantidadDias());
        estadia.setIdReserva(request.getIdReserva()); // Puede ser null

        // 5. Actualizar estado de la habitación a OCUPADA
        habitacion.setEstado(EstadoHabitacion.OCUPADA);
        habitacionRepositorio.save(habitacion);

        Estadia estadiaGuardada = estadiaRepositorio.save(estadia);
        System.out.println("✅ Estadía creada con ID: " + estadiaGuardada.getId() + 
                         ", Huéspedes: " + estadiaGuardada.getCantidadHuespedes() + 
                         ", Días: " + estadiaGuardada.getCantidadDias());
        
        return estadiaGuardada;
    }

    // Método simplificado (para compatibilidad)
    @Transactional
    public Estadia crearEstadia(Integer idHabitacion, Integer idHuesped) throws Exception {
        EstadiaControlador.CrearEstadiaRequest request = new EstadiaControlador.CrearEstadiaRequest(
            idHabitacion, idHuesped, 1, 1, null
        );
        return crearEstadiaCompleta(request);
    }

    // Para el CU11: Verificar si un huésped se alojó antes
    public boolean huespedSeHaAlojado(Integer idHuesped) { 
        List<Estadia> estadias = estadiaRepositorio.findByHuespedID(idHuesped);
        System.out.println("🔍 Huésped ID " + idHuesped + " tiene " + estadias.size() + " estadías anteriores");
        return !estadias.isEmpty();
    }

    public Optional<Estadia> buscarEstadiaActivaPorHabitacion(Integer idHabitacion) {
        // Llama a la query personalizada del repositorio
        return estadiaRepositorio.findByHabitacionIdAndOcupada(idHabitacion);
    }
}

