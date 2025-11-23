package com.example.demo.dominio; // Ajusta a tu paquete

import java.time.LocalDate;

public class Huesped {
    // Ya no son 'final' para permitir que Spring cargue los datos
    private String nombre;
    private String apellido;
    private String tipoDocumento; // Lo cambié a String para simplificar la BD, o usa Enum con cuidado
    private String numeroDocumento;
    private String cuit;
    private String posicionIVA;
    private int edad;
    private String telefono;
    private String email;
    private LocalDate fechaNacimiento;
    private String nacionalidad;
    private String ocupacion;
    private Direccion direccion;
    

    // 1. CONSTRUCTOR VACÍO (OBLIGATORIO PARA SPRING)
    public Huesped() {
    }

    // 2. CONSTRUCTOR COMPLETO (Opcional, útil para ti)
    public Huesped(String nombre, String apellido, String tipoDocumento, String numeroDocumento) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
    }

    // 3. GETTERS Y SETTERS (Spring usa los Setters para cargar los datos)
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }

    public String getCuit() { return cuit; }
    public void setCuit(String cuit) { this.cuit = cuit; }

    public String getPosicionIVA() { return posicionIVA; }
    public void setPosicionIVA(String posicionIVA) { this.posicionIVA = posicionIVA; }

    public int getEdad() { return edad; }
    public void setEdad(int edad) { this.edad = edad; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getNacionalidad() { return nacionalidad; }
    public void setNacionalidad(String nacionalidad) { this.nacionalidad = nacionalidad; }

    public String getOcupacion() { return ocupacion; }
    public void setOcupacion(String ocupacion) { this.ocupacion = ocupacion; }

    public Direccion getDireccion() { return direccion; }
    public void setDireccion(Direccion direccion) { this.direccion = direccion; }

    @Override
    public String toString() {
        return apellido + ", " + nombre + " (" + tipoDocumento + " " + numeroDocumento + ")";
    }
}