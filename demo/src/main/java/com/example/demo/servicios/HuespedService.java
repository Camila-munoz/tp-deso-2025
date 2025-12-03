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

// --- CU10: Modificar huésped (Con validación de duplicados) ---
    public Huesped modificarHuesped(Huesped huespedDatosNuevos) throws ValidacionException, EntidadNoEncontradaException {
        // 1. Buscamos el huésped original por su ID (que nunca cambia)
        if (huespedDatosNuevos.getId() == null) {
            throw new ValidacionException("El ID del huésped es obligatorio para modificar.");
        }
        
        Huesped huespedExistente = huespedRepositorio.findById(huespedDatosNuevos.getId())
                .orElseThrow(() -> new EntidadNoEncontradaException("No se encontró el huésped a modificar (ID inválido)."));

        // 2. Verificar si cambió el documento
        boolean cambioDocumento = !huespedExistente.getTipoDocumento().equalsIgnoreCase(huespedDatosNuevos.getTipoDocumento()) ||
                                  !huespedExistente.getNumeroDocumento().equalsIgnoreCase(huespedDatosNuevos.getNumeroDocumento());

        if (cambioDocumento) {
            // 3. Si cambió, verificar que el NUEVO documento no pertenezca a OTRO huésped
            Optional<Huesped> otroHuesped = huespedRepositorio.findByDocumento(
                    huespedDatosNuevos.getTipoDocumento(),
                    huespedDatosNuevos.getNumeroDocumento()
            );

            if (otroHuesped.isPresent()) {
                // Flujo Alternativo 2.B: Avisar que ya existe
                throw new ValidacionException("¡CUIDADO! El tipo y número de documento ya existen en el sistema.");
            }
        }

        // 4. Actualizar datos (JPA hace el merge automáticamente al guardar con el mismo ID)
        return huespedRepositorio.save(huespedDatosNuevos);
    }

    // --- CU10 Flujo Alternativo: Modificar con Fusión (Merge) ---
    public Huesped modificarHuespedForzado(Huesped huespedOrigen) throws EntidadNoEncontradaException, ValidacionException {
        
        // 1. Buscamos al huésped que estamos editando (Origen)
        Huesped origenEnBD = huespedRepositorio.findById(huespedOrigen.getId())
                .orElseThrow(() -> new EntidadNoEncontradaException("El huésped origen no existe."));

        // 2. Buscamos si existe OTRO huésped con el DNI nuevo (Destino)
        Optional<Huesped> destinoOpt = huespedRepositorio.findByDocumento(
                huespedOrigen.getTipoDocumento(), 
                huespedOrigen.getNumeroDocumento()
        );

        if (destinoOpt.isPresent()) {
            Huesped huespedDestino = destinoOpt.get();

            // Si son el mismo ID, es una actualización normal
            if (huespedDestino.getId().equals(huespedOrigen.getId())) {
                return huespedRepositorio.save(huespedOrigen);
            }

            // --- LÓGICA DE FUSIÓN (MERGE) ---
            // Queremos que los datos del formulario (huespedOrigen) sobrescriban al Destino.
            // Pero debemos mantener el ID del Destino para no romper sus relaciones.
            
            huespedDestino.setNombre(huespedOrigen.getNombre());
            huespedDestino.setApellido(huespedOrigen.getApellido());
            huespedDestino.setFechaNacimiento(huespedOrigen.getFechaNacimiento());
            huespedDestino.setTelefono(huespedOrigen.getTelefono());
            huespedDestino.setEmail(huespedOrigen.getEmail());
            huespedDestino.setNacionalidad(huespedOrigen.getNacionalidad());
            huespedDestino.setOcupacion(huespedOrigen.getOcupacion());
            huespedDestino.setPosicionIVA(huespedOrigen.getPosicionIVA());
            huespedDestino.setCuit(huespedOrigen.getCuit());
            
            // Actualizamos también la dirección
            if (huespedDestino.getDireccion() != null && huespedOrigen.getDireccion() != null) {
                huespedDestino.getDireccion().setCalle(huespedOrigen.getDireccion().getCalle());
                huespedDestino.getDireccion().setNumero(huespedOrigen.getDireccion().getNumero());
                huespedDestino.getDireccion().setDepartamento(huespedOrigen.getDireccion().getDepartamento());
                huespedDestino.getDireccion().setPiso(huespedOrigen.getDireccion().getPiso());
                huespedDestino.getDireccion().setCodPostal(huespedOrigen.getDireccion().getCodPostal());
                huespedDestino.getDireccion().setLocalidad(huespedOrigen.getDireccion().getLocalidad());
                huespedDestino.getDireccion().setProvincia(huespedOrigen.getDireccion().getProvincia());
                huespedDestino.getDireccion().setPais(huespedOrigen.getDireccion().getPais());
            }

            // Guardamos los cambios en el Huesped QUE YA TENÍA ESE DNI
            Huesped destinoGuardado = huespedRepositorio.save(huespedDestino);

            // Intentamos borrar el Huesped viejo (Origen) para que no queden duplicados
            try {
                huespedRepositorio.delete(origenEnBD);
            } catch (Exception e) {
                // Si falla (por ejemplo, porque el viejo tenía reservas asociadas),
                // lanzamos una advertencia o decidimos qué hacer.
                // Para este TP, lanzamos excepción para que el usuario sepa.
                throw new ValidacionException("Se actualizaron los datos en el huésped existente, pero no se pudo borrar el registro anterior porque tiene historial asociado. Contacte a soporte.");
            }

            return destinoGuardado;

        } else {
            // 3. Si no existe nadie con ese DNI, es una actualización normal (cambio de DNI limpio)
            return huespedRepositorio.save(huespedOrigen);
        }
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