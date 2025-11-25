package com.example.demo.repositorios;

import com.example.demo.modelo.Reserva;
import com.example.demo.modelo.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepositorio extends JpaRepository<Reserva, Long> {

    // Para CU06: Buscar por apellido del huésped
    List<Reserva> findByHuespedApellidoContainingIgnoreCase(String apellido);

    // Para CU04: Verificar disponibilidad
    List<Reserva> findByHabitacionesIdAndFechaSalidaAfterAndFechaEntradaBeforeAndEstadoNot(
            Long idHabitacion, 
            LocalDate fechaEntradaNueva, 
            LocalDate fechaSalidaNueva, 
            EstadoReserva estadoIgnorado);
}