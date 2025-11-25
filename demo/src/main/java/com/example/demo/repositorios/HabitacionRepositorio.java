package com.example.demo.repositorios; 

import java.util.List;
import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.EstadoHabitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitacionRepositorio extends JpaRepository<Habitacion, Long> {
    List<Habitacion> findByEstado(EstadoHabitacion estado);
}
