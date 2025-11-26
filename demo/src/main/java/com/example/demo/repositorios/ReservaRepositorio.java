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
    @Query("SELECT r FROM Reserva r JOIN r.habitaciones h " +
           "WHERE h.id IN :idsHabitaciones " +
           "AND r.estado <> 'CANCELADA' " +
           "AND (r.fechaEntrada < :fechaFin AND r.fechaSalida > :fechaInicio)")
    List<Reserva> findReservasConflictivas(
            @Param("idsHabitaciones") List<Integer> idsHabitaciones,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
    
    // Para buscar reservas de un huésped (útil para listar)
    List<Reserva> findByHuespedId(Integer idHuesped);
}