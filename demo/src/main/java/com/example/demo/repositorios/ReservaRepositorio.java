package com.example.demo.repositorios;

import com.example.demo.modelo.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

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

    List<Reserva> findByHuespedId(Integer idHuesped);

}