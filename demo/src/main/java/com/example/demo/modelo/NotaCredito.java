package com.example.demo.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Nota_Credito")
public class NotaCredito {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_NotaCredito")
    private Integer id;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    // Relación ManyToOne con Factura
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Factura", nullable = false)
    private Factura factura;
    
    // Constructores, Getters y Setters
    public NotaCredito() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public Factura getFactura() { return factura; }
    public void setFactura(Factura factura) { this.factura = factura; }
}