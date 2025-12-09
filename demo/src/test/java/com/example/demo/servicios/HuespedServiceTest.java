package com.example.demo.servicios;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Huesped;
import com.example.demo.modelo.TipoDocumento;
import com.example.demo.modelo.Direccion;
import com.example.demo.repositorios.HuespedRepositorio;

@ExtendWith(MockitoExtension.class)
public class HuespedServiceTest {

    @Mock
    private HuespedRepositorio huespedRepositorio;

    @InjectMocks
    private HuespedService huespedService;

    // --- ALTA ---
    @Test
    void darAltaHuesped_DatosCorrectos_DeberiaGuardar() throws ValidacionException {
        Huesped nuevo = new Huesped();
        nuevo.setTipoDocumento("DNI");
        nuevo.setNumeroDocumento("12345678");
        nuevo.setNombre("JUAN");

        when(huespedRepositorio.findByDocumento("DNI", "12345678")).thenReturn(Optional.empty());
        when(huespedRepositorio.save(any(Huesped.class))).thenReturn(nuevo);

        Huesped resultado = huespedService.darAltaHuesped(nuevo);

        assertNotNull(resultado);
        assertEquals("JUAN", resultado.getNombre());
        verify(huespedRepositorio, times(1)).save(any(Huesped.class));
    }

    @Test
    void darAltaHuesped_DocumentoDuplicado_DeberiaLanzarExcepcion() {
        Huesped nuevo = new Huesped();
        nuevo.setTipoDocumento("DNI");
        nuevo.setNumeroDocumento("99999999");

        when(huespedRepositorio.findByDocumento("DNI", "99999999")).thenReturn(Optional.of(new Huesped()));

        assertThrows(ValidacionException.class, () -> huespedService.darAltaHuesped(nuevo));
        verify(huespedRepositorio, never()).save(any(Huesped.class));
    }

    @Test
    void altaHuespedForzada_DeberiaActualizarSiExiste() {
        Huesped nuevoDatos = new Huesped();
        nuevoDatos.setTipoDocumento("DNI");
        nuevoDatos.setNumeroDocumento("111");
        nuevoDatos.setNombre("NUEVO NOMBRE");

        Huesped existente = new Huesped();
        existente.setId(1);
        existente.setNombre("VIEJO NOMBRE");

        when(huespedRepositorio.findByDocumento("DNI", "111")).thenReturn(Optional.of(existente));
        when(huespedRepositorio.save(any(Huesped.class))).thenAnswer(i -> i.getArguments()[0]);

        Huesped resultado = huespedService.altaHuespedForzada(nuevoDatos);

        assertEquals("NUEVO NOMBRE", resultado.getNombre()); // Debe haber actualizado el existente
        assertEquals(1, resultado.getId()); // Debe mantener el ID
    }

    // --- BÚSQUEDA ---
    @Test
    void buscarHuesped_Existente_DeberiaRetornar() throws EntidadNoEncontradaException {
        Huesped h = new Huesped();
        when(huespedRepositorio.findByDocumento("DNI", "123")).thenReturn(Optional.of(h));
        assertNotNull(huespedService.buscarHuesped("DNI", "123"));
    }

    @Test
    void buscarHuespedes_Criterios_DeberiaLlamarRepo() {
        huespedService.buscarHuespedes("PEREZ", "JUAN", "123", TipoDocumento.DNI);
        verify(huespedRepositorio, times(1)).buscarPorCriterios("PEREZ", "JUAN", "DNI", "123");
    }

    @Test
    void listarTodos_DeberiaRetornarLista() {
        huespedService.listarTodos();
        verify(huespedRepositorio, times(1)).findAll();
    }

    // --- MODIFICACIÓN ---
    @Test
    void modificarHuesped_IdInvalido_LanzaExcepcion() {
        Huesped h = new Huesped(); // Sin ID
        assertThrows(ValidacionException.class, () -> huespedService.modificarHuesped(h));
    }

    @Test
    void modificarHuesped_CambioDocumentoConflictivo_LanzaExcepcion() {
        Huesped aModificar = new Huesped();
        aModificar.setId(1);
        aModificar.setTipoDocumento("DNI");
        aModificar.setNumeroDocumento("999"); // Cambio a DNI 999

        Huesped original = new Huesped();
        original.setId(1);
        original.setTipoDocumento("DNI");
        original.setNumeroDocumento("111"); // Original era 111

        Huesped otroConflicto = new Huesped();
        otroConflicto.setId(2); // Otro huesped diferente ya tiene el 999

        when(huespedRepositorio.findById(1)).thenReturn(Optional.of(original));
        when(huespedRepositorio.findByDocumento("DNI", "999")).thenReturn(Optional.of(otroConflicto));

        assertThrows(ValidacionException.class, () -> huespedService.modificarHuesped(aModificar));
    }
    
    @Test
    void modificarHuespedForzado_Fusion_DeberiaBorrarViejoYActualizarNuevo() throws Exception {
        Huesped origen = new Huesped(); 
        origen.setId(1); 
        origen.setTipoDocumento("DNI"); origen.setNumeroDocumento("222"); // Quiere cambiarse al DNI 222
        origen.setDireccion(new Direccion());

        Huesped destino = new Huesped();
        destino.setId(2); // Ya existe alguien con DNI 222
        destino.setTipoDocumento("DNI"); destino.setNumeroDocumento("222");
        destino.setDireccion(new Direccion());

        when(huespedRepositorio.findById(1)).thenReturn(Optional.of(origen));
        when(huespedRepositorio.findByDocumento("DNI", "222")).thenReturn(Optional.of(destino));
        when(huespedRepositorio.save(any(Huesped.class))).thenReturn(destino);

        huespedService.modificarHuespedForzado(origen);

        // Verificamos que guardó el destino actualizado
        verify(huespedRepositorio).save(destino);
        // Verificamos que borró el origen (el ID 1) para evitar duplicados
        verify(huespedRepositorio).delete(origen);
    }

    // --- BAJA ---
    @Test
    void darBajaHuesped_Existente_DeberiaBorrar() throws EntidadNoEncontradaException {
        Huesped h = new Huesped();
        when(huespedRepositorio.findByDocumento("DNI", "123")).thenReturn(Optional.of(h));
        
        huespedService.darBajaHuesped("DNI", "123");
        
        verify(huespedRepositorio, times(1)).delete(h);
    }
}