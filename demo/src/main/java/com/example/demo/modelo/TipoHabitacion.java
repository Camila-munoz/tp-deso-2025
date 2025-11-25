package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Tipo_Habitacion")
public class TipoHabitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TipoHabitacion")
    private Integer id;

    @Column(name = "descripcion")
    private String descripcion;

    // Constructor vacío
    public TipoHabitacion() {
    }

    public TipoHabitacion(Integer id, String descripcion) {
        this.id = id;
        this.descripcion=descripcion;
    }

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}