package com.example.demo.servicios;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Huesped;
import com.example.demo.repositorios.HuespedRepositorio;

@Service
public class HuespedService {

    @Autowired
    private HuespedRepositorio huespedRepositorio;

    // --- CU09: Dar de alta huésped ---
    public Huesped darAltaHuesped(Huesped huesped) throws ValidacionException {
        // 1. Validaciones básicas
        if (huesped.getNumeroDocumento() == null || huesped.getNumeroDocumento().isEmpty()) {
            throw new ValidacionException("El número de documento es obligatorio.");
        }
        if (huesped.getTipoDocumento() == null) {
            throw new ValidacionException("El tipo de documento es obligatorio.");
        }

        // 2. Verificar si ya existe
        Optional<Huesped> existente = huespedRepositorio.findByDocumento(
                huesped.getTipoDocumento(), 
                huesped.getNumeroDocumento()
        );

        if (existente.isPresent()) {
            throw new ValidacionException("El huésped ya existe con ese tipo y número de documento.");
        }

        // 3. Guardar y retornar
        return huespedRepositorio.save(huesped); // ✅ CORREGIDO: Retornar el resultado
    }

    // --- CU02: Buscar huésped ---
    public Huesped buscarHuesped(String tipoDoc, String nroDoc) throws EntidadNoEncontradaException {
        return huespedRepositorio.findByDocumento(tipoDoc, nroDoc)
                .orElseThrow(() -> new EntidadNoEncontradaException("Huésped no encontrado."));
    }

    // --- CU10: Modificar huésped ---
    public Huesped modificarHuesped(Huesped huespedDatosNuevos) throws ValidacionException, EntidadNoEncontradaException {
        // 1. Buscamos el huésped ORIGINAL en la base de datos para obtener su ID
        Huesped huespedExistente = huespedRepositorio.findByDocumento(
                huespedDatosNuevos.getTipoDocumento(), 
                huespedDatosNuevos.getNumeroDocumento()
        ).orElseThrow(() -> new EntidadNoEncontradaException("No se puede modificar. El huésped no existe."));
       
        // 2. Asignamos el ID del existente al nuevo (FUNDAMENTAL para que JPA sepa que es un UPDATE)
        huespedDatosNuevos.setId(huespedExistente.getId());

        // 3. Guardamos (al tener ID, JPA hace un UPDATE en vez de INSERT)
        return huespedRepositorio.save(huespedDatosNuevos);
    }

    // --- CU11: Dar de baja huésped ---
    public void darBajaHuesped(String tipoDoc, String nroDoc) throws EntidadNoEncontradaException {
        // 1. Buscamos el huésped para obtener la entidad completa
        Huesped huesped = huespedRepositorio.findByDocumento(tipoDoc, nroDoc)
                .orElseThrow(() -> new EntidadNoEncontradaException("No se puede eliminar. El huésped no existe."));
        
        // 2. Eliminamos la entidad
        huespedRepositorio.delete(huesped);
    }

    // --- Listar todos (Auxiliar) ---
    public List<Huesped> listarTodos() {
        return huespedRepositorio.findAll();
    }
}