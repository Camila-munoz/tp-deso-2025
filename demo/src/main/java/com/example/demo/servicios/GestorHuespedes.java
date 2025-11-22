/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.servicios;

import com.example.demo.datos.dao.HuespedDAO;
import com.example.demo.datos.dao.EstadiaDAO;
import com.example.demo.dominio.Huesped;
import com.example.demo.dominio.PosicionIVA;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;
import java.util.stream.Collectors;

public class GestorHuespedes {

    private static GestorHuespedes instancia;
    private final HuespedDAO huespedDAO;
    private final EstadiaDAO estadiaDAO;

    private GestorHuespedes() {
        this.huespedDAO = DAOFactory.getHuespedDAO();
        this.estadiaDAO = DAOFactory.getEstadiaDAO(); 
    }
    public static GestorHuespedes getInstancia() {
        if (instancia == null) {
            instancia = new GestorHuespedes();
        }
        return instancia;
    }

    /**
     * Busca huéspedes aplicando filtros. Usa streams y expresiones lambda[cite: 8].
     * @param apellido Criterio de búsqueda por apellido (comienza con).
     * @param nombre Criterio de búsqueda por nombre (comienza con).
     * @param numDoc Criterio de búsqueda por número de documento (exacto).
     * @return Lista de huéspedes que coinciden con los criterios.
     */
    public List<Huesped> buscarHuespedes(String apellido, String nombre, String numDoc) {
        return huespedDAO.buscarTodos().stream()
                .filter(h -> apellido.isEmpty() || h.getApellido().toLowerCase().startsWith(apellido.toLowerCase()))
                .filter(h -> nombre.isEmpty() || h.getNombre().toLowerCase().startsWith(nombre.toLowerCase()))
                .filter(h -> numDoc.isEmpty() || h.getNumeroDocumento().equals(numDoc))
                .collect(Collectors.toList());
    }

    /**
     * Da de alta un nuevo huésped, previa validación y verificación de existencia.
     * @param huesped El huésped a registrar.
     * @throws ValidacionException Si los datos son inválidos o el huésped ya existe.
    */
    public void altaHuesped(Huesped huesped) throws ValidacionException {
        altaHuesped(huesped, false);
    }
    
    /**
     * Sobrecarga para dar de alta un nuevo huésped, permitiendo omitir la validación de existencia.
     * @param huesped El huésped a registrar.
     * @param aceptarIgualmente Si es true, permite registrar un huésped aunque el documento ya exista (CU09 Flujo Alternativo 2.B.2.1).
     * @throws ValidacionException Si los datos son inválidos.
     */
    public void altaHuesped(Huesped huesped, boolean aceptarIgualmente) throws ValidacionException {
        validarHuesped(huesped);
        if (!aceptarIgualmente) {
            Optional<Huesped> existente = huespedDAO.buscarPorDocumento(
                huesped.getTipoDocumento().toString(), huesped.getNumeroDocumento()
            );
            if (existente.isPresent()) {
                throw new ValidacionException("Ya existe un huésped con el mismo tipo y número de documento.");
            }
        }
        huespedDAO.guardar(huesped);
    }

    /**
     * Modifica los datos de un huésped existente, previa validación.
     * @param huesped El huésped con los datos actualizados.
     * @throws ValidacionException Si los datos son inválidos.
     * @throws EntidadNoEncontradaException Si el huésped a modificar no existe.
     */
    public void modificarHuesped(Huesped huesped) throws ValidacionException, EntidadNoEncontradaException {
        validarHuesped(huesped);
        huespedDAO.buscarPorDocumento(
            huesped.getTipoDocumento().toString(), huesped.getNumeroDocumento()
        ).orElseThrow(() -> new EntidadNoEncontradaException("No se encontró el huésped a modificar."));
        huespedDAO.actualizar(huesped);
    }
    
    /**
     * Da de baja a un huésped.
     * @param tipoDoc Tipo de documento del huésped.
     * @param numDoc Número de documento del huésped.
     * @throws EntidadNoEncontradaException Si el huésped no existe.
     */
    public void bajaHuesped(String tipoDoc, String numDoc) throws EntidadNoEncontradaException {
        huespedDAO.buscarPorDocumento(tipoDoc, numDoc)
            .orElseThrow(() -> new EntidadNoEncontradaException("No se encontró el huésped a eliminar."));

        huespedDAO.eliminar(tipoDoc, numDoc);
    }
    
    /**
     * Verifica si un huésped tiene registros de estadías previas.
     * NOTA: Simulación para cumplir con el CU11. Se debe implementar la lógica real.
     * @param tipoDoc Tipo de documento.
     * @param numDoc Número de documento.
     * @return false por defecto, simulando que no tiene estadías.
     */
    public boolean huespedSeHaAlojado(String tipoDoc, String numDoc) {
        return !estadiaDAO.buscarPorHuesped(tipoDoc, numDoc).isEmpty();
    }

    /**
     * Valida los datos obligatorios de un huésped y acumula todos los errores.
     * @param huesped El huésped a validar.
     * @throws ValidacionException Si uno o más campos obligatorios están vacíos.
     */
    private void validarHuesped(Huesped huesped) throws ValidacionException {
        List<String> errores = new ArrayList<>();
        if (huesped.getApellido() == null || huesped.getApellido().trim().isEmpty()) {
            errores.add("- El Apellido es obligatorio.");
        }
        if (huesped.getNombre() == null || huesped.getNombre().trim().isEmpty()) {
            errores.add("- El Nombre es obligatorio.");
        }
        if (huesped.getTipoDocumento() == null) {
            errores.add("- El T de documento es obligatorio.");
        }
        if (huesped.getNumeroDocumento() == null || huesped.getNumeroDocumento().trim().isEmpty()) {
            errores.add("- El Número de documento es obligatorio.");
        }
        if (huesped.getPosicionIVA() == null) {
            errores.add("- La posición frente al IVA es obligatoria.");
        }
        if (huesped.getFechaNacimiento() == null) {
            errores.add("- La Fecha de Nacimiento es obligatoria.");
        }
        if (huesped.getDireccion().getCalle() == null || huesped.getDireccion().getCalle().trim().isEmpty()) {
             errores.add("- La Calle de la dirección es obligatoria.");
        }
        if (huesped.getDireccion().getNumero() == 0) {
             errores.add("- El número de la dirección es obligatorio.");
        }
        if (huesped.getDireccion().getCodPostal()== null || huesped.getDireccion().getCodPostal().trim().isEmpty()) {
             errores.add("- El codigo postal de la dirección es obligatorio.");
        }
        if (huesped.getDireccion().getLocalidad()== null || huesped.getDireccion().getLocalidad().trim().isEmpty()) {
             errores.add("- La localidad de la dirección es obligatoria.");
        }
        if (huesped.getDireccion().getProvincia()== null || huesped.getDireccion().getProvincia().trim().isEmpty()) {
             errores.add("- La provincia de la dirección es obligatoria.");
        }
        if (huesped.getDireccion().getPais()== null || huesped.getDireccion().getPais().trim().isEmpty()) {
             errores.add("- El País de la dirección es obligatorio.");
        }
        if (huesped.getTelefono() == null || huesped.getTelefono().trim().isEmpty()) {
            errores.add("- El Telefono es obligatorio.");
        }
        if (huesped.getOcupacion() == null || huesped.getOcupacion().trim().isEmpty()) {
            errores.add("- La ocupacion es obligatoria.");
        }
        if (huesped.getNacionalidad() == null || huesped.getNacionalidad().trim().isEmpty()) {
            errores.add("- La nacionalidad es obligatoria.");
        }
        if (!errores.isEmpty()) {
            String mensajeCompleto = "Se han encontrado las siguientes omisiones:\n" + String.join("\n", errores);
            throw new ValidacionException(mensajeCompleto);
        }
    }
    
    public Optional<Huesped> buscarPorDocumento(String tipoDoc, String numDoc) {
        return huespedDAO.buscarPorDocumento(tipoDoc, numDoc);
    }
    public PosicionIVA solicitarPosicionIVA(PosicionIVA valorActual) {
        System.out.println("Posición frente al IVA actual: " + valorActual);
        System.out.println("Opciones:");
        System.out.println("1. Consumidor Final");
        System.out.println("2. Responsable Inscripto");
        System.out.println("3. Monotributo");
        System.out.println("4. Exento");
        System.out.println("0. Mantener actual");
        System.out.print("Seleccione opción: ");
        
        Scanner sc = new Scanner(System.in);
        String opcion = sc.nextLine().trim();
        //if (esCancelar(opcion)) return null;
        
        switch (opcion) {
            case "1": return PosicionIVA.CONSUMIDOR_FINAL;
            case "2": return PosicionIVA.RESPONSABLE_INSCRIPTO;
            case "3": return PosicionIVA.MONOTRIBUTO;
            case "4": return PosicionIVA.EXENTO;
            case "0": return valorActual;
            default: 
                System.out.println("❌ Opción inválida. Manteniendo valor actual.");
                return valorActual;
        }
    }
        public class ModificacionCanceladaException extends RuntimeException {
        public ModificacionCanceladaException() {
            super("Modificación cancelada por el usuario");
        }
    }
}
