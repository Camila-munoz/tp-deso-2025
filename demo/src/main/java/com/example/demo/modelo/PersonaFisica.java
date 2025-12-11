package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("FISICA") 
public class PersonaFisica extends ResponsableDePago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Persona_Fisica")
    private Integer id;

    @Column(name = "ID_Huesped") 
    private Integer idHuesped;

    @Column(name = "cuit")
    private String cuit;

    @Column(name = "posicion_IVA")
    private String posicionIVA;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    // CONSTRUCTOR VACÍO
    public PersonaFisica() { }

    // GETTERS Y SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getIdHuesped() { return idHuesped; }  
    public void setIdHuesped(Integer idHuesped) { this.idHuesped = idHuesped; }

    public String getCuit() { return cuit; }
    public void setCuit(String cuit) { this.cuit = cuit; }

    public String getPosicionIVA() { return posicionIVA; }
    public void setPosicionIVA(String posicionIVA) { this.posicionIVA = posicionIVA; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    
    // Método para validar mayoría de edad
    public boolean esMayorDeEdad() {
        if (fechaNacimiento == null) return false;
        return fechaNacimiento.plusYears(18).isBefore(LocalDate.now());
    }
}