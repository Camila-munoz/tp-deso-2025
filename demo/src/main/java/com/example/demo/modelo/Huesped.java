package com.example.demo.modelo; 

import java.time.LocalDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "huespedes")
public class Huesped {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Huesped")
    private Long id;

    private String nombre;
    private String apellido;

    @Column(name = "tipo_documento")
    private String tipoDocumento; // Lo cambié a String para simplificar la BD, o usa Enum con cuidado
    
    @Column(name = "numero_documento")
    private String numeroDocumento;

    private String cuit;
    private String posicionIVA;
    private int edad;
    private String telefono;
    private String email;
    private LocalDate fechaNacimiento;
    private String nacionalidad;
    private String ocupacion;


    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ID_Direccion") // Nombre exacto de la FK en tabla Huesped
    private Direccion direccion;
    

    // 1. CONSTRUCTOR VACÍO
    public Huesped() {
    }

    // 2. CONSTRUCTOR COMPLETO
    public Huesped(String nombre, String apellido, String tipoDocumento, String numeroDocumento) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
    }

    // 3. GETTERS Y SETTERS (Spring usa los Setters para cargar los datos)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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