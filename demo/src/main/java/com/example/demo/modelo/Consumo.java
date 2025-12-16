package com.example.demo.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Consumo")
public class Consumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Consumo")
    private Integer id;

    @Column(name = "tipo")
    private String descripcion; 

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @ManyToOne
    @JoinColumn(name = "ID_Estadia", nullable = false)
    private Estadia estadia;
    

    public Consumo() {}

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public Estadia getEstadia() { return estadia; }
    public void setEstadia(Estadia estadia) { this.estadia = estadia; }
}
