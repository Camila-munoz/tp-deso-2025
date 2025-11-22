/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.dominio;

import java.time.LocalDate;
/**
 *
 * @author I-MAG
 */
public class Huesped {
    
    //atributos inmutables
    private final String nombre;
    private final String apellido;
    private final TipoDocumento tipoDocumento;
    private final String cuit;
    private final String numeroDocumento;
    private final PosicionIVA posicionIVA;
    private final int edad;
    private final String telefono;
    private final Direccion direccion;
    private final String email;
    private final LocalDate fechaNacimiento;
    private final String nacionalidad;
    private final String ocupacion;
    
    //constructor privado, solo el Builder lo puede llamar
    private Huesped(Builder builder) {
        this.nombre = builder.nombre;
        this.apellido = builder.apellido;
        this.tipoDocumento = builder.tipoDocumento;
        this.cuit = builder.cuit;
        this.numeroDocumento = builder.numeroDocumento;
        this.posicionIVA = builder.posicionIVA;
        this.edad = builder.edad;
        this.telefono = builder.telefono;
        this.direccion = builder.direccion;
        this.email = builder.email;
        this.fechaNacimiento = builder.fechaNacimiento;
        this.nacionalidad = builder.nacionalidad;
        this.ocupacion = builder.ocupacion;
    }
    
    //getters
    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
    public TipoDocumento getTipoDocumento() { return tipoDocumento; }
    public String getCuit() { return cuit; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public PosicionIVA getPosicionIVA() { return posicionIVA; }
    public int getEdad() { return edad; }
    public String getTelefono() { return telefono; }
    public Direccion getDireccion() { return direccion; }
    public String getEmail() { return email; }  
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public String getNacionalidad() { return nacionalidad; }
    public String getOcupacion() { return ocupacion; }
 
    @Override
    public String toString() {
        return apellido + ", " + nombre + " (" + tipoDocumento + " " + numeroDocumento + ")";
    }
    
    public static class Builder{
        private  String nombre;
        private  String apellido;
        private  TipoDocumento tipoDocumento;
        private  String numeroDocumento;
        private  String cuit;
        private  PosicionIVA posicionIVA;
        private  int edad;
        private  String telefono;
        private  Direccion direccion;
        private  String email;
        private  LocalDate fechaNacimiento;
        private  String nacionalidad;
        private  String ocupacion;
    
        //constructor para un Huesped NUEVO (solo pide el ID)
        public Builder(TipoDocumento tipo, String numDoc) {
            this.tipoDocumento = tipo;
            this.numeroDocumento = numDoc;
        }
        
        public Builder(Huesped existente) {
            this.nombre = existente.getNombre();
            this.apellido = existente.getApellido();
            this.tipoDocumento = existente.getTipoDocumento();
            this.numeroDocumento = existente.getNumeroDocumento();
            this.cuit = existente.getCuit();
            this.posicionIVA = existente.getPosicionIVA();
            this.telefono = existente.getTelefono();
            this.direccion = existente.getDireccion();
            this.email = existente.getEmail();
            this.fechaNacimiento = existente.getFechaNacimiento();
            this.nacionalidad = existente.getNacionalidad();
            this.ocupacion = existente.getOcupacion();
        }
        
        public Builder setNombre(String nombre) { this.nombre = nombre;return this; }
        public Builder setApellido(String apellido) { this.apellido = apellido;return this; }
        public Builder setTipoDocumento(TipoDocumento tipoDocumento) { this.tipoDocumento = tipoDocumento;return this; }
        public Builder setCuit(String cuit) { this.cuit = cuit; return this; }
        public Builder setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento;return this; }
        public Builder setPosicionIVA(PosicionIVA posicionIVA) { this.posicionIVA = posicionIVA;return this; }
        public Builder setEdad(int edad) { this.edad = edad;return this; }
        public Builder setTelefono(String telefono) { this.telefono = telefono;return this; }
        public Builder setDireccion(Direccion direccion) { this.direccion = direccion;return this; }
        public Builder setEmail(String email) { this.email = email;return this; }
        public Builder setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento;return this; }
        public Builder setNacionalidad(String nacionalidad) { this.nacionalidad = nacionalidad;return this; }
        public Builder setOcupacion(String ocupacion) { this.ocupacion = ocupacion;return this; }

        public Huesped build() { return new Huesped(this); }
    }
}