package com.example.demo.dominio;

public class Conserje {

    private int idConserje;
    private String nombre;
    private String contrasena;

    public Conserje() {
    }

    public int getIdConserje() {
        return idConserje;
    }

    public void setIdConserje(int idConserje) {
        this.idConserje = idConserje;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}
