package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Conserje")
public class Conserje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Conserje")
    private int idConserje;
    
    @Column(name = "nombre", nullable = false, length = 20)
    private String nombre;
    
    @Column(name = "contrasena", nullable = false, length = 20)
    private String contrasena;

    // Constructores
    public Conserje() {
    }

    public Conserje(String nombre, String contrasena) {
        this.nombre = nombre;
        this.contrasena = contrasena;
    }

    // Getters y Setters
    public int getIdConserje() { return idConserje; }
    public void setIdConserje(int idConserje) { this.idConserje = idConserje; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    @Override
    public String toString() {
        return "Conserje{id=" + idConserje + ", nombre='" + nombre + "'}";
    }
}