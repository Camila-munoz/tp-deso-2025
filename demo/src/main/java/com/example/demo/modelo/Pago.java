package com.example.demo.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "Pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Pago")
    private Integer id;

    @Column(name = "monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    // Relación ManyToOne con Factura
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Factura", nullable = false)
    private Factura factura;

    // Relación OneToMany con Medio_de_Pago (Asumo que la clase se llama MedioDePago)
    @OneToMany(mappedBy = "pago", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedioDePago> mediosDePago;
    
    // Constructores, Getters y Setters
    public Pago() {}
    
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    
    public Factura getFactura() { return factura; }
    public void setFactura(Factura factura) { this.factura = factura; }
    
    public List<MedioDePago> getMediosDePago() { return mediosDePago; }
    public void setMediosDePago(List<MedioDePago> mediosDePago) { this.mediosDePago = mediosDePago; }
}