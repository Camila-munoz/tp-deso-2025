<<<<<<< HEAD:demo/src/main/java/com/example/demo/modelo/Conserje.java
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "conserjes")
public class Conserje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String usuario;
    private String contrasenia;

    public Conserje() {
    }

    public Conserje(String usuario, String contrasenia) {
        this.usuario = usuario;
        this.contrasenia = contrasenia;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUsuario() { return usuario;}
    public void setUsuario(String usuario) {  this.usuario = usuario; }

    public String getContrasenia() { return contrasenia; }
    public void setContrasenia(String contrasenia) { this.contrasenia = contrasenia; }
    
    @Override
    public String toString() {
        return "Conserje{" +
                "usuario='" + usuario + '\'' +
                ", contrasenia='" + contrasenia + '\'' +
                '}';
=======
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
>>>>>>> ce33725384b8423b34cb56bea61609f9da54efdd:demo/src/main/java/com/example/demo/dominio/Conserje.java
    }
}
