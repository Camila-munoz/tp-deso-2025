package com.example.demo.dominio; // 1. Asegúrate que coincida con tu paquete

public class Habitacion {

    // ATRIBUTOS (Deben coincidir con lo que quieras guardar)
    private Integer id;
    private String numero;
    private String tipo;      // Ej: "Simple", "Doble"
    private Double precio;
    private String estado;    // Ej: "DISPONIBLE", "MANTENIMIENTO"

    // CONSTRUCTOR VACÍO (Necesario para que Java trabaje cómodamente)
    public Habitacion() {
    }

    // CONSTRUCTOR CON DATOS (Para crear habitaciones rápido en las pruebas)
    public Habitacion(String numero, String tipo, Double precio, String estado) {
        this.numero = numero;
        this.tipo = tipo;
        this.precio = precio;
        this.estado = estado;
    }

    // GETTERS Y SETTERS (Para poder leer y escribir los datos)
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    // TOSTRING (Para que al imprimir no salga "Habitacion@34b7a")
    @Override
    public String toString() {
        return "Habitacion [id=" + id + ", numero=" + numero + ", precio=" + precio + "]";
    }
}