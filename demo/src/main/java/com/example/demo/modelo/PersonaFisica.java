package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Persona_Fisica")
@PrimaryKeyJoinColumn(name = "ID_Responsable")
public class PersonaFisica extends ResponsableDePago {
    
    @Column(name = "ID_Huesped") 
    private Integer idHuesped;

    // Relación de lectura para acceder a los datos del Huesped real
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Huesped", insertable = false, updatable = false)
    private Huesped huespedEntidad;

    public PersonaFisica() { }

    public Integer getIdHuesped() { return idHuesped; }  
    public void setIdHuesped(Integer idHuesped) { this.idHuesped = idHuesped; }
    
    public Huesped getHuespedEntidad() { return huespedEntidad; }

    public boolean esMayorDeEdad() {
        if (huespedEntidad != null && huespedEntidad.getFechaNacimiento() != null) {
            return huespedEntidad.getFechaNacimiento().plusYears(18).isBefore(LocalDate.now());
        }
        return false;
    }
}