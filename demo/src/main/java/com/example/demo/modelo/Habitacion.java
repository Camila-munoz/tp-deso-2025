package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Habitacion")
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Habitacion")
    private Integer id;
    
    @Column(name = "numero")
    private String numero;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ID_TipoHabitacion") // Ajusta según tu BD
    private CategoriaHabitacion tipo;
    
    @Column(name = "costo") // En tu BD es "costo", no "precio"
    private Double precio;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoHabitacion estado;

     @Column(name = "capacidad")  // ✅ Asegúrate que sea Integer, no int
    private Integer capacidad;   // ✅ Para evitar el mismo problema

    // CONSTRUCTOR VACÍO
    public Habitacion() {
    }

    // CONSTRUCTOR CON DATOS
    public Habitacion(String numero, CategoriaHabitacion tipo, Double precio, EstadoHabitacion estado, int capacidad) {
        this.numero = numero;
        this.tipo = tipo;
        this.precio = precio;
        this.estado = estado;
        this.capacidad = capacidad; 
    }

    // GETTERS Y SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

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

    @Override
    public String toString() {
        return "Habitacion [id=" + id + ", numero=" + numero + ", precio=" + precio + "]";
    }
}