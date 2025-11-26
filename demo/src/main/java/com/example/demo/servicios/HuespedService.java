package com.example.demo.servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Huesped;
import com.example.demo.modelo.TipoDocumento; // Asumo que esta clase es tu Enum
import com.example.demo.repositorios.HuespedRepositorio;
import org.springframework.transaction.annotation.Transactional; // Necesario para modificación/alta

@Service
@Transactional
public class HuespedService {

    @Autowired
    private HuespedRepositorio huespedRepositorio;

    // --- CU02: Buscar Huéspedes por múltiples criterios ---
    public List<Huesped> buscarHuespedes(String apellido, String nombre, String numDoc, TipoDocumento tipoDoc) {
        
        // Convertimos el Enum a String para el repositorio (que usa String en la DB)
        String tipoDocStr = (tipoDoc != null) ? tipoDoc.toString() : null;
        
        // La consulta usa LIKE y/o igualdad, por lo que convertimos a mayúsculas
        // para coincidir con la DB si guardas en mayúsculas (como sugiere tu CLI).
        String apellidoUpper = (apellido != null && !apellido.isEmpty()) ? apellido.toUpperCase() : null;
        String nombreUpper = (nombre != null && !nombre.isEmpty()) ? nombre.toUpperCase() : null;
        
        return huespedRepositorio.buscarPorCriterios(
            apellidoUpper,
            nombreUpper,
            tipoDocStr,
            numDoc
        );
    }

    // --- CU09: Dar de alta huésped (Flujo principal: No acepta duplicados) ---
    public Huesped darAltaHuesped(Huesped huesped) throws ValidacionException {
        // 1. Validaciones básicas
        if (huesped.getNumeroDocumento() == null || huesped.getNumeroDocumento().isEmpty()) {
            throw new ValidacionException("El número de documento es obligatorio.");
        }
        if (huesped.getTipoDocumento() == null || huesped.getTipoDocumento().isEmpty()) {
            throw new ValidacionException("El tipo de documento es obligatorio.");
        }

        // 2. Verificar si ya existe (para el Flujo Alternativo 2.B)
        Optional<Huesped> existente = huespedRepositorio.findByDocumento(
                huesped.getTipoDocumento(), 
                huesped.getNumeroDocumento()
        );

        if (existente.isPresent()) {
            // Este caso fuerza al controlador a preguntar al usuario si desea guardar un duplicado (CU09, Flujo Alternativo 2.B)
            throw new ValidacionException("El huésped ya existe con ese tipo y número de documento. La operación debe ser modificada o forzada.");
        }
        
        // 3. Guardar y retornar
        return huespedRepositorio.save(huesped);
    }
    
    // --- CU09: Flujo Alternativo 2.B (Alta forzada de duplicado) ---
    /**
     * Guarda la entidad sin verificar existencia, utilizado cuando el usuario acepta el duplicado.
     * @param huesped La entidad a guardar.
     * @return El huésped guardado.
     */
    public Huesped altaHuespedForzada(Huesped huesped) {
        // Aseguramos que sea un nuevo registro (si el ID estaba cargado por error)
        huesped.setId(null); 
        return huespedRepositorio.save(huesped);
    }
    
    // --- CU02: Buscar huésped por documento exacto (Mantenido del código anterior) ---
    public Huesped buscarHuesped(String tipoDoc, String nroDoc) throws EntidadNoEncontradaException {
        return huespedRepositorio.findByDocumento(tipoDoc, nroDoc)
                .orElseThrow(() -> new EntidadNoEncontradaException("Huésped no encontrado."));
    }

    // --- CU10, CU11, Listar se mantienen ---
    public Huesped modificarHuesped(Huesped huespedDatosNuevos) throws ValidacionException, EntidadNoEncontradaException {
        // Lógica para obtener ID del existente y guardar
        Huesped huespedExistente = huespedRepositorio.findByDocumento(
                huespedDatosNuevos.getTipoDocumento(), 
                huespedDatosNuevos.getNumeroDocumento()
        ).orElseThrow(() -> new EntidadNoEncontradaException("No se puede modificar. El huésped no existe."));
        
        huespedDatosNuevos.setId(huespedExistente.getId());
        return huespedRepositorio.save(huespedDatosNuevos);
    }

    public void darBajaHuesped(String tipoDoc, String nroDoc) throws EntidadNoEncontradaException {
        Huesped huesped = huespedRepositorio.findByDocumento(tipoDoc, nroDoc)
                .orElseThrow(() -> new EntidadNoEncontradaException("No se puede eliminar. El huésped no existe."));
        huespedRepositorio.delete(huesped);
    }

    public List<Huesped> listarTodos() {
        return huespedRepositorio.findAll();
    }
}