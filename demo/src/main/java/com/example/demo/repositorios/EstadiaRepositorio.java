package com.example.demo.repositorios;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // <--- AGREGAR ESTE IMPORT

import com.example.demo.modelo.Estadia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadiaRepositorio extends JpaRepository<Estadia, Integer> {
    
    @Query("SELECT e FROM Estadia e WHERE e.huesped.id = :idHuesped")
    List<Estadia> findByHuespedID(@Param("idHuesped") Integer idHuesped);

    // Busca estadías que se solapen con el rango de fechas solicitado
    @Query("SELECT e FROM Estadia e " +
           "WHERE e.habitacion.id = :idHabitacion " +
           "AND e.checkOut IS NOT NULL " + // Solo estadías activas o futuras definidas
           "AND (e.checkIn < :fechaFin AND e.checkOut > :fechaInicio)")
    List<Estadia> findEstadiasConflictivas(
            @Param("idHabitacion") Integer idHabitacion,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT e FROM Estadia e WHERE e.habitacion.id = :idHabitacion AND e.habitacion.estado = 'OCUPADA'")
    Optional<Estadia> findByHabitacionIdAndOcupada(@Param("idHabitacion") Integer idHabitacion);
}