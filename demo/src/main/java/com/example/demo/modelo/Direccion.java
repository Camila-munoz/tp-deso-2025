package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "direcciones")
public class Direccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Agregué ID porque la BD lo genera y lo necesitamos recuperar
   
    private String calle;
    private int numero;
    private String departamento;
    private int piso;
    private String codPostal;
    private String localidad;
    private String provincia;
    private String pais;

    // 1. CONSTRUCTOR VACÍO (NECESARIO PARA SPRING/POSTMAN)
    public Direccion() {
    }

    // Constructor privado para usar con Builder (Tu código original)
    private Direccion(Builder builder) {
        this.calle = builder.calle;
        this.numero = builder.numero;
        this.departamento = builder.departamento;
        this.codPostal = builder.codPostal;
        this.piso = builder.piso;
        this.localidad = builder.localidad;
        this.provincia = builder.provincia;
        this.pais = builder.pais;
    }

    // 2. GETTERS Y SETTERS (AGREGAR SETTERS ES NECESARIO PARA SPRING)
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

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

    // Tu Builder original (Lo dejamos tal cual)
    public static class Builder {
        private String calle;
        private int numero;
        private String departamento;
        private String codPostal;
        private int piso;
        private String localidad;
        private String provincia;
        private String pais;

        public Builder calle(String calle) { this.calle = calle; return this; }
        public Builder numero(int numero) { this.numero = numero; return this; }
        public Builder departamento(String departamento) { this.departamento = departamento; return this; }
        public Builder codPostal(String codPostal) { this.codPostal = codPostal; return this; }
        public Builder piso(int piso) { this.piso = piso; return this; }
        public Builder localidad(String localidad) { this.localidad = localidad; return this; }
        public Builder provincia(String provincia) { this.provincia = provincia; return this; }
        public Builder pais(String pais) { this.pais = pais; return this; }

        public Direccion build() { return new Direccion(this); }
    }
}
