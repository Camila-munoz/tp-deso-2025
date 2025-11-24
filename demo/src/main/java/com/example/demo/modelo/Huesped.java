package com.example.demo.modelo; 

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Huesped")
public class Huesped {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Huesped")
    private Integer id;

    @Column(name = "nombre", nullable = false)
    private String nombre;
    
    @Column(name = "apellido")
    private String apellido;
    
    @Column(name = "tipo_documento")
    private String tipoDocumento;
    
    @Column(name = "nro_documento")
    private String numeroDocumento;
    
    @Column(name = "cuit")
    private String cuit;
    
    @Column(name = "posicion_IVA")
    private String posicionIVA;
    
    @Column(name = "edad")  // ✅ CAMBIADO: int -> Integer
    private Integer edad;   // ✅ Ahora puede ser null
    
    @Column(name = "telefono")
    private String telefono;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    
    @Column(name = "nacionalidad")
    private String nacionalidad;
    
    @Column(name = "ocupacion")
    private String ocupacion;
    
    // ✅ CORREGIDO: Relación OneToOne con Direccion
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ID_Direccion")
    private Direccion direccion;
    
    // Constructores
    public Huesped() {
    }

    public Huesped(String nombre, String apellido, String tipoDocumento, String numeroDocumento) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
    }

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
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

    public Integer getEdad() { return edad; }           // ✅ Integer
    public void setEdad(Integer edad) { this.edad = edad; } // ✅ Integer

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