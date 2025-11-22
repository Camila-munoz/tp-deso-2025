/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.dominio;

/**
 *
 * @author I-MAG
 */
public class Direccion {
    private String calle;
    private int numero;
    private String departamento;
    private int piso;
    private String codPostal;
    private String localidad;
    private String provincia;
    private String pais;

    // Constructor privado para usar con Builder
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

    // Getters
    public String getCalle() { return calle; }
    public int getNumero() { return numero; }
    public String getDepartamento() { return departamento; }
    public String getCodPostal() { return codPostal; }
    public int getPiso() { return piso; }
    public String getLocalidad() { return localidad; }
    public String getProvincia() { return provincia; }
    public String getPais() { return pais; }

   @Override
    public String toString() {
        return String.format("%s %d, %s, %s, %s, %s", calle, numero, localidad, provincia, pais, codPostal);
    }


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
