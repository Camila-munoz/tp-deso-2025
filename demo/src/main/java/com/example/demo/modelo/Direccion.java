package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "direcciones")
public class Direccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_direccion")
    private Long id; // Agregué ID porque la BD lo genera y lo necesitamos recuperar
   
    private String calle;
    private int numero;
    private String departamento;
    private int piso;

    @Column(name = "cod_postal")
    private String codPostal;

    private String localidad;
    private String provincia;
    private String pais;

    // 1. CONSTRUCTOR VACÍO (NECESARIO PARA SPRING/POSTMAN)
    public Direccion() {
    }

    public Direccion(String calle, int numero, String departamento, int piso, String codPostal, String localidad,
        String provincia, String pais) {
        this.calle = calle;
        this.numero = numero;
        this.departamento = departamento;
        this.piso = piso;
        this.codPostal = codPostal;
        this.localidad = localidad;
        this.provincia = provincia;
        this.pais = pais;
    }

    // 2. GETTERS Y SETTERS (AGREGAR SETTERS ES NECESARIO PARA SPRING)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }

    public int getNumero() { return numero; }
    public void setNumero(int numero) { this.numero = numero; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getCodPostal() { return codPostal; }
    public void setCodPostal(String codPostal) { this.codPostal = codPostal; }

    public int getPiso() { return piso; }
    public void setPiso(int piso) { this.piso = piso; }

    public String getLocalidad() { return localidad; }
    public void setLocalidad(String localidad) { this.localidad = localidad; }

    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    @Override
    public String toString() {
        return String.format("%s %d, %s, %s, %s, %s", calle, numero, localidad, provincia, pais, codPostal);
    }
}
