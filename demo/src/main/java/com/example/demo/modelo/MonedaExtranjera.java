package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Moneda_extranjera")
public class MonedaExtranjera {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Moneda_Extranjera")
    private Integer id;
    
    @Column(name = "tipo", length = 20)
    private String tipo; // Ejemplo: USD, EUR, BRL, etc.

    public MonedaExtranjera() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
}