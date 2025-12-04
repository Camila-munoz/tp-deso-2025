package com.example.demo.repositorios;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.modelo.Reserva;

@Repository
public interface ReservaRepositorio extends JpaRepository<Reserva, Integer> {

    // --- CU04: VALIDAR DISPONIBILIDAD ---
    // Busca si la habitación está ocupada en esas fechas (ignorando canceladas)
    @Query("SELECT r FROM Reserva r " +
           "WHERE r.habitacion.id = :idHabitacion " + 
           "AND r.estado <> com.example.demo.modelo.EstadoReserva.CANCELADA " +
           "AND (r.fechaEntrada < :fechaFin AND r.fechaSalida > :fechaInicio)")
    List<Reserva> findReservasConflictivas(
            @Param("idHabitacion") Integer idHabitacion,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );

    // --- CU06: BUSCAR PARA CANCELAR ---
    // Busca por Apellido (obligatorio) y Nombre (opcional) en el texto guardado (Snapshot)
    @Query("SELECT r FROM Reserva r WHERE " +
           "LOWER(r.apellidoHuesped) LIKE LOWER(CONCAT(:apellido, '%')) " +
           "AND (:nombre IS NULL OR LOWER(r.nombreHuesped) LIKE LOWER(CONCAT(:nombre, '%'))) " +
           "AND r.estado <> com.example.demo.modelo.EstadoReserva.CANCELADA")
    List<Reserva> buscarActivasPorCriterios(
            @Param("apellido") String apellido, 
            @Param("nombre") String nombre
    );

    // --- CU15: CONFLICTO ---
    // Busca quién tiene reservada la habitación en una fecha puntual
    @Query("SELECT r FROM Reserva r WHERE r.habitacion.id = :idHabitacion " +
           "AND :fecha >= r.fechaEntrada AND :fecha < r.fechaSalida " +
           "AND r.estado = com.example.demo.modelo.EstadoReserva.CONFIRMADA")
    Optional<Reserva> findReservaEnFecha(
            @Param("idHabitacion") Integer idHabitacion, 
            @Param("fecha") LocalDate fecha
    );
}