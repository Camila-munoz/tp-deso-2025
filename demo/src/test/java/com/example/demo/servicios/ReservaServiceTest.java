package com.example.demo.servicios;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.controladores.ReservaControlador.DetalleReserva;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Habitacion;
import com.example.demo.modelo.Reserva;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.ReservaRepositorio;

@ExtendWith(MockitoExtension.class)
public class ReservaServiceTest {

    @Mock
    private ReservaRepositorio reservaRepositorio;
    
    @Mock
    private HabitacionRepositorio habitacionRepositorio;

    @InjectMocks
    private ReservaService reservaService;

    @Test
    void crearReserva_HabitacionDisponible_DeberiaCrear() throws Exception {
        // 1. ARRANGE (Preparar datos)
        DetalleReserva detalle = new DetalleReserva();
        detalle.setIdHabitacion(10);
        detalle.setFechaEntrada("2025-01-01");
        detalle.setFechaSalida("2025-01-05");
        
        List<DetalleReserva> listaDetalles = new ArrayList<>();
        listaDetalles.add(detalle);

        Habitacion habMock = new Habitacion();
        habMock.setId(10);
        habMock.setNumero("101");

        // Mocks:
        // A. Que encuentre la habitación
        when(habitacionRepositorio.findById(10)).thenReturn(Optional.of(habMock));
        
        // B. Que NO haya conflictos de fechas (devuelve lista vacía)
        when(reservaRepositorio.findReservasConflictivas(eq(10), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new ArrayList<>()); // Lista vacía = libre

        // C. Al guardar, devolvemos una reserva con ID
        when(reservaRepositorio.save(any(Reserva.class))).thenAnswer(invocation -> {
            Reserva r = invocation.getArgument(0);
            r.setId(100); // Simulamos que la BD le puso ID
            return r;
        });

        // 2. ACT (Ejecutar)
        List<Reserva> resultado = reservaService.crearReserva(listaDetalles, "Pepe", "Argento", "12345");

        // 3. ASSERT (Verificar)
        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        assertEquals(100, resultado.get(0).getId());
        assertEquals("Pepe", resultado.get(0).getNombreHuesped());
    }

    @Test
    void crearReserva_FechasOcupadas_DeberiaFallar() {
        // 1. ARRANGE
        DetalleReserva detalle = new DetalleReserva();
        detalle.setIdHabitacion(10);
        detalle.setFechaEntrada("2025-01-01");
        detalle.setFechaSalida("2025-01-05");
        List<DetalleReserva> lista = List.of(detalle);

        Habitacion habMock = new Habitacion();
        habMock.setId(10);
        habMock.setNumero("101");

        when(habitacionRepositorio.findById(10)).thenReturn(Optional.of(habMock));

        // SIMULAMOS CONFLICTO: La BD devuelve una reserva existente en esas fechas
        List<Reserva> conflicto = List.of(new Reserva());
        when(reservaRepositorio.findReservasConflictivas(eq(10), any(), any()))
            .thenReturn(conflicto); 

        // 2. y 3. ACT & ASSERT
        ValidacionException ex = assertThrows(ValidacionException.class, () -> {
            reservaService.crearReserva(lista, "Pepe", "Argento", "1234");
        });

        assertTrue(ex.getMessage().contains("no está disponible"));
        // Verificamos que NUNCA se guardó nada
        verify(reservaRepositorio, never()).save(any(Reserva.class));
    }
}