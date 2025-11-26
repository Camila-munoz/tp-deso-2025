package com.example.demo.servicios;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Consumo;
import com.example.demo.modelo.EstadoFactura;
import com.example.demo.modelo.Factura;
import com.example.demo.repositorios.FacturaRepositorio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Transactional
public class FacturaService {

    @Autowired
    private FacturaRepositorio facturaRepositorio;
    @Autowired
    private com.example.demo.repositorios.ConsumoRepositorio consumoRepositorio;
    @Autowired
    private com.example.demo.repositorios.EstadiaRepositorio estadiaRepositorio;
    @Autowired
    private com.example.demo.repositorios.HuespedRepositorio huespedRepositorio; // Opcional, si accedes via estadia.getHuesped() no hace falta.

    /**
     * CU: Crea una nueva factura.
     * La entidad Factura debe contener los objetos Estadia y ResponsableDePago con sus IDs cargados.
     */
    public Factura crearFactura(Factura factura) throws ValidacionException, EntidadNoEncontradaException {
        
        // 1. Validaciones básicas de los datos de Factura
        if (factura.getMonto() == null || factura.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidacionException("El monto de la factura debe ser positivo.");
        }
        if (factura.getTipo() == null || (!factura.getTipo().equalsIgnoreCase("A") && !factura.getTipo().equalsIgnoreCase("B"))) {
            throw new ValidacionException("El tipo de factura debe ser 'A' o 'B'.");
        }
        
        // 2. Validar que los IDs de las relaciones estén presentes en el DTO/Entidad de entrada
        if (factura.getEstadia() == null || factura.getEstadia().getId() == null) {
            throw new ValidacionException("Debe proporcionar el ID de la Estadia dentro del objeto 'estadia'.");
        }
        if (factura.getResponsable() == null || factura.getResponsable().getId() == null) {
            throw new ValidacionException("Debe proporcionar el ID del Responsable de Pago dentro del objeto 'responsable'.");
        }

        // 3. Establecer el estado inicial y el ID de Factura a nulo (para forzar un INSERT)
        factura.setId(null); // Asegura que JPA cree una nueva entidad
        factura.setEstado(EstadoFactura.PENDIENTE); // Siempre inicia como PENDIENTE

        // 4. Guardar. Si los IDs de Estadia o Responsable no existen, 
        // la base de datos lanzará una ConstraintViolationException que el Controller capturará como 500.
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
        
        // Lógica de negocio adicional (ej. verificar que el total de Pagos cubra el Monto) iría aquí.
        
        factura.setEstado(EstadoFactura.PAGADA);
        
        return facturaRepositorio.save(factura);
    }
    
    // Si fuera necesario, puedes agregar métodos para obtener y eliminar facturas.
// ... tus @Autowired existentes (FacturaRepositorio) ...
    
    // --- NUEVO MÉTODO PARA CU07 (PRE-FACTURA) ---
    public java.util.Map<String, Object> generarPrevisualizacion(Integer idEstadia) throws EntidadNoEncontradaException {
        // 1. Buscar la estadía
        com.example.demo.modelo.Estadia estadia = estadiaRepositorio.findById(idEstadia)
                .orElseThrow(() -> new EntidadNoEncontradaException("Estadía no encontrada"));

        BigDecimal total = BigDecimal.ZERO;
        java.util.List<java.util.Map<String, Object>> items = new java.util.ArrayList<>();

        // 2. Calcular costo de la habitación (Precio x Días)
        // Nota: Asumo que en Habitacion el precio es Double, lo convertimos a BigDecimal
        BigDecimal precioNoche = BigDecimal.valueOf(estadia.getHabitacion().getPrecio());
        BigDecimal costoEstadia = precioNoche.multiply(new BigDecimal(estadia.getCantidadDias()));
        
        items.add(java.util.Map.of(
            "concepto", "Alojamiento (" + estadia.getCantidadDias() + " noches en Hab. " + estadia.getHabitacion().getNumero() + ")",
            "monto", costoEstadia
        ));
        total = total.add(costoEstadia);

        // 3. Sumar consumos
        java.util.List<Consumo> consumos = consumoRepositorio.findByEstadia_Id(idEstadia);
        for (Consumo c : consumos) {
            items.add(java.util.Map.of(
                "concepto", "Consumo: " + c.getDescripcion(),
                "monto", c.getPrecio()
            ));
            total = total.add(c.getPrecio());
        }

        // 4. Determinar si es Factura A o B (Regla de negocio simple)
        String tipoFactura = "B";
        // Verificamos si la posición IVA es Responsable Inscripto
        if (estadia.getHuesped().getPosicionIVA() != null && 
            estadia.getHuesped().getPosicionIVA().contains("RESPONSABLE_INSCRIPTO")) {
            tipoFactura = "A";
        }

        // 5. Retornar estructura lista para el JSON
        return java.util.Map.of(
            "huesped", estadia.getHuesped().getNombre() + " " + estadia.getHuesped().getApellido(),
            "subtotal", total,
            "total", total, // Aquí podrías sumar IVA si fuera necesario separar
            "tipoFactura", tipoFactura,
            "items", items
        );
    }
}
