package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Efectivo")
public class Efectivo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Efectivo")
    private Integer id;

    // Aquí podrías agregar campos como 'montoRecibido', 'cambioDevuelto', si fueran necesarios.

    public Efectivo() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
}