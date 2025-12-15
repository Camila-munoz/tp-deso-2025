package com.example.demo.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "Persona_Juridica")
@PrimaryKeyJoinColumn(name = "ID_Responsable")
public class PersonaJuridica extends ResponsableDePago {

    @Column(name = "ID_Direccion") 
    private Integer idDireccion;

    @Column(name = "CUIT_Responsable") 
    private String cuit;
    
    @Column(name = "razon_social") 
    private String razonSocial;

    // CONSTRUCTOR VACÍO
    public PersonaJuridica() { }

    // GETTERS Y SETTERS
    public int getHuesped() { return idDireccion; }  
    public void setHuesped(int idHuesped) { this.idDireccion = idDireccion; }

    public String getCuit() { return cuit; }
    public void setCuit(String cuit) { this.cuit = cuit; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
}
