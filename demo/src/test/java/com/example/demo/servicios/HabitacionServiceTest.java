package com.example.demo.servicios;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.modelo.*;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.repositorios.HabitacionRepositorio;
import com.example.demo.repositorios.ReservaRepositorio;

@ExtendWith(MockitoExtension.class)
public class HabitacionServiceTest {

    @Mock
    private HabitacionRepositorio habitacionRepositorio;
    @Mock
    private ReservaRepositorio reservaRepositorio;
    @Mock
    private EstadiaRepositorio estadiaRepositorio;

    @InjectMocks
    private HabitacionService habitacionService;

    @Test
    void mostrarEstado_HabitacionOcupada_DeberiaRetornarEstadoOcupada() throws Exception {
        // ARRANGE
        LocalDate hoy = LocalDate.now();
        LocalDate manana = hoy.plusDays(1);

        // 1. Simulamos 1 habitación en la base de datos
        Habitacion hab = new Habitacion();
        hab.setId(1);
        hab.setNumero("101");
        hab.setEstado(EstadoHabitacion.LIBRE); // Estado base (si no tuviera estadía)

        when(habitacionRepositorio.findAll()).thenReturn(List.of(hab));

        // 2. Simulamos que hay una ESTADÍA activa hoy
        Estadia estadia = new Estadia();
        estadia.setCheckIn(hoy.atStartOfDay());       // Entró hoy a las 00:00
        estadia.setCheckOut(manana.atStartOfDay());   // Sale mañana
        
        // Mock de estadías conflictivas
        when(estadiaRepositorio.findEstadiasConflictivas(eq(1), any(), any()))
                .thenReturn(List.of(estadia));

        // Mock de reservas (vacío para este test)
        when(reservaRepositorio.findReservasConflictivas(eq(1), any(), any()))
                .thenReturn(new ArrayList<>());

        // ACT
        List<Map<String, Object>> grilla = habitacionService.mostrarEstadoHabitaciones(hoy, hoy);

        // ASSERT
        assertFalse(grilla.isEmpty());
        
        // Verificamos el primer elemento de la grilla
        Map<String, Object> celda = grilla.get(0);
        
        assertEquals(1, celda.get("idHabitacion"));
        assertEquals(hoy.toString(), celda.get("fecha"));
        
        // ¡LO IMPORTANTE!: El estado calculado debe ser OCUPADA, no LIBRE
        assertEquals(EstadoHabitacion.OCUPADA, celda.get("estado"));
    }

    @Test
    void mostrarEstado_HabitacionFueraDeServicio_DeberiaPriorizarMantenimiento() throws Exception {
        // Si la habitación está rota (FUERA_DE_SERVICIO), debe mostrarse así 
        // aunque tenga reservas antiguas o errores de sistema.
        
        LocalDate hoy = LocalDate.now();
        Habitacion hab = new Habitacion();
        hab.setId(2);
        hab.setEstado(EstadoHabitacion.FUERA_DE_SERVICIO); // La habitación está rota

        when(habitacionRepositorio.findAll()).thenReturn(List.of(hab));
        
        // Mocks vacíos para que no interfieran
        when(estadiaRepositorio.findEstadiasConflictivas(anyInt(), any(), any())).thenReturn(new ArrayList<>());
        when(reservaRepositorio.findReservasConflictivas(anyInt(), any(), any())).thenReturn(new ArrayList<>());

        // Act
        List<Map<String, Object>> grilla = habitacionService.mostrarEstadoHabitaciones(hoy, hoy);

        // Assert
        assertEquals(EstadoHabitacion.FUERA_DE_SERVICIO, grilla.get(0).get("estado"));
    }
}