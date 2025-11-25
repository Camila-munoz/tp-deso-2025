package com.example.demo.modelo;

import jakarta.persistence.*; 
@Entity 
@Table(name = "habitaciones")
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numero;

    @Enumerated(EnumType.STRING)
    private CategoriaHabitacion tipo;

    private Double precio;
    private Integer capacidad;
    private Integer cantidad;
    private Double porcentaje_descuento;

    @Enumerated(EnumType.STRING)
    private EstadoHabitacion estado;

    // CONSTRUCTOR VACÍO (Necesario para que Java trabaje cómodamente)
    public Habitacion() {
    }

    // CONSTRUCTOR CON DATOS (Para crear habitaciones rápido en las pruebas)
    public Habitacion(String numero, CategoriaHabitacion tipo, Double precio, Integer capacidad, Integer cantidad, Double porcentaje_descuento, EstadoHabitacion estado) {
        this.numero = numero;
        this.tipo = tipo;
        this.precio = precio;
        this.capacidad = capacidad;
        this.estado = estado;
        this.cantidad = cantidad;
        this.porcentaje_descuento = porcentaje_descuento;
    }

    // GETTERS Y SETTERS (Para poder leer y escribir los datos)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumero() { return numero; }    
    public void setNumero(String numero) { this.numero = numero; }

    public CategoriaHabitacion getTipo() { return tipo; }
    public void setTipo(CategoriaHabitacion tipo) { this.tipo = tipo; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
   
    public EstadoHabitacion getEstado() { return estado; }
    public void setEstado(EstadoHabitacion estado) { this.estado = estado; }

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Double getPorcentaje_descuento() { return porcentaje_descuento; }
    public void setPorcentaje_descuento(Double porcentaje_descuento) { this.porcentaje_descuento = porcentaje_descuento; }

    @Override
    public String toString() {
        return "Habitacion [id=" + id + ", numero=" + numero + ", precio=" + precio + "]";
    }
}