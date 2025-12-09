package com.example.demo.servicios;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.*;
import com.example.demo.repositorios.ConsumoRepositorio;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.repositorios.FacturaRepositorio;
import com.example.demo.repositorios.HuespedRepositorio;

@ExtendWith(MockitoExtension.class)
public class FacturaServiceTest {

    @Mock
    private FacturaRepositorio facturaRepositorio;
    @Mock
    private ConsumoRepositorio consumoRepositorio;
    @Mock
    private EstadiaRepositorio estadiaRepositorio;
    @Mock
    private HuespedRepositorio huespedRepositorio;

    @InjectMocks
    private FacturaService facturaService;

    // --- TEST 1: Crear Factura Exitosa ---
    @Test
    void crearFactura_DatosValidos_DeberiaGuardar() throws Exception {
        // Arrange
        Factura factura = new Factura();
        factura.setMonto(new BigDecimal("1000.00"));
        factura.setTipo("B");
        
        // Simulamos objetos con ID para las relaciones
        Estadia estadiaMock = new Estadia(); estadiaMock.setId(1);
        ResponsableDePago respMock = new ResponsableDePago(); respMock.setId(1);
        
        factura.setEstadia(estadiaMock);
        factura.setResponsable(respMock);

        when(facturaRepositorio.save(any(Factura.class))).thenReturn(factura);

        // Act
        Factura resultado = facturaService.crearFactura(factura);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoFactura.PENDIENTE, resultado.getEstado()); // Verifica que el servicio puso PENDIENTE
        verify(facturaRepositorio, times(1)).save(any(Factura.class));
    }

    // --- TEST 2: Validación de Monto Negativo ---
    @Test
    void crearFactura_MontoNegativo_DeberiaLanzarExcepcion() {
        Factura factura = new Factura();
        factura.setMonto(new BigDecimal("-50.00")); // Inválido

        assertThrows(ValidacionException.class, () -> {
            facturaService.crearFactura(factura);
        });
    }

    // --- TEST 3: Previsualización (Cálculo de Totales) ---
    @Test
    void generarPrevisualizacion_CalculoCorrecto_DeberiaSumarEstadiaYConsumos() throws Exception {
        // Arrange: Preparamos una estadía de 2 días a $100 la noche
        int idEstadia = 10;
        
        Habitacion hab = new Habitacion();
        hab.setCosto(new BigDecimal("100.00"));
        hab.setNumero("101");

        Estadia estadia = new Estadia();
        estadia.setId(idEstadia);
        estadia.setCantidadDias(2);
        estadia.setHabitacion(hab);

        // Preparamos un huésped
        Huesped huesped = new Huesped();
        huesped.setNombre("JUAN");
        huesped.setApellido("PEREZ");
        huesped.setPosicionIVA("CONSUMIDOR_FINAL");

        // Preparamos consumos: 1 Coca de $50
        Consumo consumo = new Consumo();
        consumo.setDescripcion("Coca Cola");
        consumo.setPrecio(new BigDecimal("50.00"));

        // Mocks
        when(estadiaRepositorio.findById(idEstadia)).thenReturn(Optional.of(estadia));
        when(huespedRepositorio.findByEstadiaId(idEstadia)).thenReturn(Optional.of(huesped));
        when(consumoRepositorio.findByEstadia_Id(idEstadia)).thenReturn(List.of(consumo));

        // Act
        Map<String, Object> resultado = facturaService.generarPrevisualizacion(idEstadia);

        // Assert
        // Calculo esperado: (100 * 2) + 50 = 250
        BigDecimal totalCalculado = (BigDecimal) resultado.get("total");
        assertEquals(new BigDecimal("250.00"), totalCalculado);
        assertEquals("B", resultado.get("tipoFactura")); // Consumidor final = B
    }

    // --- TEST 4: Pagar Factura ---
    @Test
    void marcarComoPagada_FacturaPendiente_DeberiaCambiarAPagada() throws Exception {
        Factura f = new Factura();
        f.setId(1);
        f.setEstado(EstadoFactura.PENDIENTE);

        when(facturaRepositorio.findById(1)).thenReturn(Optional.of(f));
        when(facturaRepositorio.save(any(Factura.class))).thenReturn(f);

        Factura resultado = facturaService.marcarComoPagada(1);

        assertEquals(EstadoFactura.PAGADA, resultado.getEstado());
    }
}
