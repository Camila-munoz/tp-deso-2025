package com.example.demo.servicios;

import com.example.demo.datos.dao.HuespedDAO;
import com.example.demo.dominio.Huesped;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HuespedService {

    @Autowired
    private HuespedDAO huespedDAO;

    // --- CU09: Dar de alta huésped ---
    public void darAltaHuesped(Huesped huesped) throws ValidacionException {
        // 1. Validaciones básicas
        if (huesped.getNumeroDocumento() == null || huesped.getNumeroDocumento().isEmpty()) {
            throw new ValidacionException("El número de documento es obligatorio.");
        }
        if (huesped.getTipoDocumento() == null) {
            throw new ValidacionException("El tipo de documento es obligatorio.");
        }

        // 2. Verificar si ya existe (Aquí estaba tu ERROR, agregamos .toString())
        // El DAO espera (String, String), pero el dominio tiene (Enum, String)
        Optional<Huesped> existente = huespedDAO.buscarPorDocumento(
                huesped.getTipoDocumento().toString(), 
                huesped.getNumeroDocumento()
        );

        if (existente.isPresent()) {
            throw new ValidacionException("El huésped ya existe con ese tipo y número de documento.");
        }

        // 3. Guardar
        huespedDAO.guardar(huesped);
    }

    // --- CU02: Buscar huésped ---
    public Huesped buscarHuesped(String tipoDoc, String nroDoc) throws EntidadNoEncontradaException {
        return huespedDAO.buscarPorDocumento(tipoDoc, nroDoc)
                .orElseThrow(() -> new EntidadNoEncontradaException("Huésped no encontrado."));
    }

    // --- CU10: Modificar huésped ---
    public void modificarHuesped(Huesped huesped) throws ValidacionException, EntidadNoEncontradaException {
        // Validamos que exista antes de intentar modificar
        Optional<Huesped> existente = huespedDAO.buscarPorDocumento(
                huesped.getTipoDocumento().toString(), 
                huesped.getNumeroDocumento()
        );

        if (existente.isEmpty()) {
            throw new EntidadNoEncontradaException("No se puede modificar. El huésped no existe.");
        }

        huespedDAO.actualizar(huesped);
    }

    // --- CU11: Dar de baja huésped ---
    public void darBajaHuesped(String tipoDoc, String nroDoc) throws EntidadNoEncontradaException {
        // Verificamos si existe antes de borrar
        if (huespedDAO.buscarPorDocumento(tipoDoc, nroDoc).isEmpty()) {
            throw new EntidadNoEncontradaException("No se puede eliminar. El huésped no existe.");
        }
        
        // Aquí podrías agregar lógica extra: "Si tiene reservas activas, no borrar"
        
        huespedDAO.eliminar(tipoDoc, nroDoc);
    }

    // --- Listar todos (Auxiliar) ---
    public List<Huesped> listarTodos() {
        return huespedDAO.buscarTodos();
    }
}
