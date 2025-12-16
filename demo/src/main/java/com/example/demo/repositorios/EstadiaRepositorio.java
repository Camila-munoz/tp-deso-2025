package com.example.demo.repositorios;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // <--- AGREGAR ESTE IMPORT

import com.example.demo.modelo.Consumo;
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
    @Query("SELECT e FROM Estadia e WHERE e.habitacion.id = :idHabitacion AND " +
       "(e.checkOut >= :fechaInicio OR e.checkOut IS NULL) AND " +
       "e.checkIn <= :fechaFin")
    List<Estadia> findEstadiasConflictivas(
            @Param("idHabitacion") Integer idHabitacion,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT e FROM Estadia e WHERE e.habitacion.id = :idHabitacion AND e.habitacion.estado = 'OCUPADA'")
    Optional<Estadia> findByHabitacionIdAndOcupada(@Param("idHabitacion") Integer idHabitacion);

    // Buscar estadía activa por habitación (check-out nulo)
    @Query("SELECT e FROM Estadia e WHERE e.habitacion.id = :habitacionId AND e.checkOut IS NULL")
    Optional<Estadia> findEstadiaActivaByHabitacion(@Param("habitacionId") Integer habitacionId);
    
    // Buscar todas las estadías de una habitación
    List<Estadia> findByHabitacionId(Integer habitacionId);
    
    // Buscar consumos de una estadía
    @Query("SELECT c FROM Consumo c WHERE c.estadia.id = :estadiaId")
    List<Consumo> findConsumosByEstadiaId(@Param("estadiaId") Integer estadiaId);
}