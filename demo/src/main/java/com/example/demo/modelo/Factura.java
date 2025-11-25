package com.example.demo.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "Factura")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Factura")
    private Integer id;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto; 

    @Column(name = "tipo", nullable = false, length = 2)
    private String tipo; // Tipo A o B

    @Column(name = "estado", nullable = false, length = 50)
    @Enumerated(EnumType.STRING) 
    private EstadoFactura estado; // Usando el Enum EstadoFactura

    // Relación ManyToOne con Estadia
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Estadia", nullable = false)
    private Estadia estadia;

    // Relación ManyToOne con Responsable_de_pago
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Responsable", nullable = false)
    private ResponsableDePago responsable; 

    // Relación OneToMany con Nota_Credito (mappedBy apunta al campo 'factura' en NotaCredito)
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NotaCredito> notasCredito; 

    // Relación OneToMany con Pago (mappedBy apunta al campo 'factura' en Pago)
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pago> pagos; 
    
    // Constructores, Getters y Setters
    public Factura() {}

    // ... (El resto de getters y setters, ya que son extensos, se omiten aquí, pero deben existir)
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public EstadoFactura getEstado() { return estado; }
    public void setEstado(EstadoFactura estado) { this.estado = estado; }
    
    public Estadia getEstadia() { return estadia; }
    public void setEstadia(Estadia estadia) { this.estadia = estadia; }

    public ResponsableDePago getResponsable() { return responsable; }
    public void setResponsable(ResponsableDePago responsable) { this.responsable = responsable; }
    
    public List<NotaCredito> getNotasCredito() { return notasCredito; }
    public void setNotasCredito(List<NotaCredito> notasCredito) { this.notasCredito = notasCredito; }
    
    public List<Pago> getPagos() { return pagos; }
    public void setPagos(List<Pago> pagos) { this.pagos = pagos; }
}