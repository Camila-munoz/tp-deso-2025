package com.example.demo.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@DiscriminatorValue("JURIDICA")
public class PersonaJuridica extends ResponsableDePago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Persona_Juridica")
    private Integer id;

    @Column(name = "idDireccion") 
    private Integer idDireccion;

    @Column(name = "cuit") 
    private String cuit;
    @Column(name = "Razon_Social") 
    private String Razon_Social;

    // CONSTRUCTOR VACÍO
    public PersonaJuridica() { }

    // GETTERS Y SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public int getHuesped() { return idDireccion; }  
    public void setHuesped(int idHuesped) { this.idDireccion = idDireccion; }

    public String getCuit() { return cuit; }
    public void setCuit(String cuit) { this.cuit = cuit; }

    public String getRazon_Social() { return Razon_Social; }
    public void setRazon_Social(String razon_Social) { Razon_Social = razon_Social; }
}
