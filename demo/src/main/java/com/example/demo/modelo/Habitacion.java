package com.example.demo.modelo;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Habitacion")
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Habitacion")
    private Integer id;
    
    @Column(name = "numero")
    private String numero;

    @Column(name = "estado")
    @Enumerated(EnumType.STRING)
    private EstadoHabitacion estado;
    
    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "costo")
    private BigDecimal costo;

    @Column(name = "capacidad")  
    private Integer capacidad;   

    @Column(name = "porcentaje_descuento")
    private BigDecimal porcentajeDescuento;

    @ManyToOne
    @JoinColumn(name = "ID_TipoHabitacion", nullable = false)
    private TipoHabitacion tipo;
 
    // CONSTRUCTOR VACÍO
    public Habitacion() {
    }
    

    // GETTERS Y SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNumero() { return numero; }    
    public void setNumero(String numero) { this.numero = numero; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public TipoHabitacion getTipo() { return tipo; }
    public void setTipo(TipoHabitacion tipo) { this.tipo = tipo; }

    public BigDecimal getCosto() { return costo; }
    public void setCosto(BigDecimal costo) { this.costo = costo; }
   
    public EstadoHabitacion getEstado() { return estado; }
    public void setEstado(EstadoHabitacion estado) { this.estado = estado; }
    
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public BigDecimal getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(BigDecimal porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    @Override
    public String toString() {
        return "Habitacion [id=" + id + ", numero=" + numero + ", costo=" + costo + "]";
    }
}