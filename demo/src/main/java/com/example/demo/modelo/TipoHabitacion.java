package com.example.demo.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "TipoHabitacion")
public class TipoHabitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TipoHabitacion")
    private Integer id;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "cantidad_camas_kingSize")
    private Integer cantidadCamasKingSize;

    @Column(name = "cantidad_camas_individuales")
    private Integer cantidadCamasIndividuales;

    @Column(name = "cantidad_camas_dobles")
    private Integer cantidadCamasDobles;

    // Constructor vacío
    public TipoHabitacion() {
    }

    public TipoHabitacion(Integer id, String descripcion) {
        this.id = id;
        this.descripcion=descripcion;
        this.cantidadCamasKingSize = cantidadCamasKingSize;
        this.cantidadCamasIndividuales = cantidadCamasIndividuales;
        this.cantidadCamasDobles = cantidadCamasDobles;
    }

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getCantidadCamasKingSize() { return cantidadCamasKingSize; }
    public void setCantidadCamasKingSize(Integer cantidadCamasKingSize) { this.cantidadCamasKingSize = cantidadCamasKingSize; }

    public Integer getCantidadCamasIndividuales() { return cantidadCamasIndividuales; }
    public void setCantidadCamasIndividuales(Integer cantidadCamasIndividuales) { this.cantidadCamasIndividuales = cantidadCamasIndividuales; }

    public Integer getCantidadCamasDobles() { return cantidadCamasDobles; }
    public void setCantidadCamasDobles(Integer cantidadCamasDobles) { this.cantidadCamasDobles = cantidadCamasDobles; }
}