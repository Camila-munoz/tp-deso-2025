package com.example.demo.modelo;

import jakarta.persistence.*;

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

    public PersonaJuridica() { }

    public Integer getIdDireccion() { return idDireccion; }  
    public void setIdDireccion(Integer idDireccion) { this.idDireccion = idDireccion; }

    public String getCuit() { return cuit; }
    public void setCuit(String cuit) { this.cuit = cuit; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
}