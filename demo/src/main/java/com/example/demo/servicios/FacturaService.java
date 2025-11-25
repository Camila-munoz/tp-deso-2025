package com.example.demo.servicios;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Estadia;
import com.example.demo.modelo.EstadoFactura;
import com.example.demo.modelo.Factura;
import com.example.demo.modelo.ResponsableDePago;
import com.example.demo.repositorios.EstadiaRepositorio;
import com.example.demo.repositorios.FacturaRepositorio;
import com.example.demo.repositorios.ResponsableDePagoRepositorio;
import com.example.demo.servicios.request.CrearFacturaRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class FacturaService {

    @Autowired
    private FacturaRepositorio facturaRepositorio;

    @Autowired
    private EstadiaRepositorio estadiaRepositorio;

    @Autowired
    private ResponsableDePagoRepositorio responsableRepositorio;

    /**
     * CU: Crea una nueva factura asociada a una Estadía y un Responsable.
     */
    public Factura crearFactura(CrearFacturaRequest request) throws EntidadNoEncontradaException, ValidacionException {
        
        // 1. Validaciones básicas del request
        if (request.getMonto() == null || request.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidacionException("El monto de la factura debe ser positivo.");
        }
        if (request.getTipo() == null || (!request.getTipo().equalsIgnoreCase("A") && !request.getTipo().equalsIgnoreCase("B"))) {
            throw new ValidacionException("El tipo de factura debe ser 'A' o 'B'.");
        }

        // 2. Verificar existencia de entidades relacionadas
        Estadia estadia = estadiaRepositorio.findById(request.getIdEstadia())
                .orElseThrow(() -> new EntidadNoEncontradaException("Estadía no encontrada con ID: " + request.getIdEstadia()));

        ResponsableDePago responsable = responsableRepositorio.findById(request.getIdResponsable())
                .orElseThrow(() -> new EntidadNoEncontradaException("Responsable de Pago no encontrado con ID: " + request.getIdResponsable()));

        // 3. Crear la entidad Factura
        Factura factura = new Factura();
        factura.setMonto(request.getMonto());
        factura.setTipo(request.getTipo().toUpperCase());
        factura.setEstado(EstadoFactura.PENDIENTE); // Siempre inicia como PENDIENTE
        factura.setEstadia(estadia);
        factura.setResponsable(responsable);

        // 4. Guardar y retornar la entidad
        return facturaRepositorio.save(factura);
    }

    /**
     * CU: Marca una factura como PAGADA.
     */
    public Factura marcarComoPagada(Integer idFactura) throws EntidadNoEncontradaException, ValidacionException {
        Factura factura = facturaRepositorio.findById(idFactura)
                .orElseThrow(() -> new EntidadNoEncontradaException("Factura no encontrada con ID: " + idFactura));

        if (factura.getEstado() == EstadoFactura.PAGADA) {
            throw new ValidacionException("La factura ya se encuentra PAGADA.");
        }
        
        // Aquí se debería verificar que existan Pagos que cubran el Monto total
        // Por simplicidad, solo cambiamos el estado
        factura.setEstado(EstadoFactura.PAGADA);
        
        return facturaRepositorio.save(factura);
    }
}
