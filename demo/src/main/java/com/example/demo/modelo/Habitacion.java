package com.example.demo.modelo; // 1. Asegúrate que coincida con tu paquete

public class Habitacion {

    private Integer id;
    private String numero;
    private CategoriaHabitacion tipo;
    private Double precio;
    private EstadoHabitacion estado;

    // CONSTRUCTOR VACÍO (Necesario para que Java trabaje cómodamente)
    public Habitacion() {
    }

    // CONSTRUCTOR CON DATOS (Para crear habitaciones rápido en las pruebas)
    public Habitacion(String numero, CategoriaHabitacion tipo, Double precio, EstadoHabitacion estado) {
        this.numero = numero;
        this.tipo = tipo;
        this.precio = precio;
        this.estado = estado;
    }

    // GETTERS Y SETTERS (Para poder leer y escribir los datos)
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

    @Override
    public String toString() {
        return "Habitacion [id=" + id + ", numero=" + numero + ", precio=" + precio + "]";
    }
}