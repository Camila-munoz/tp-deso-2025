package com.example.demo.repositorios;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.modelo.Reserva;

@Repository
public interface ReservaRepositorio extends JpaRepository<Reserva, Integer> {

    // Validar Disponibilidad (CU04):
    // Busca si hay alguna reserva ACTIVA que se solape con las fechas para esas habitaciones.
   @Query("SELECT r FROM Reserva r " +
           "WHERE r.habitacion.id = :idHabitacion " + 
           "AND r.estado <> com.example.demo.modelo.EstadoReserva.CANCELADA " +
           "AND (r.fechaEntrada < :fechaFin AND r.fechaSalida > :fechaInicio)")
    List<Reserva> findReservasConflictivas(
            @Param("idHabitacion") Integer idHabitacion,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );

    // Busca por el apellido guardado (CU6 Cancelar Reserva)
    @Query("SELECT r FROM Reserva r WHERE " +
           "LOWER(r.apellidoHuesped) LIKE LOWER(CONCAT(:apellido, '%')) " +
           "AND r.estado <> com.example.demo.modelo.EstadoReserva.CANCELADA")
    List<Reserva> buscarPorApellido(@Param("apellido") String apellido);

}