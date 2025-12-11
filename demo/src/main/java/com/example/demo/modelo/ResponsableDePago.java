package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Responsable_de_pago")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_responsable", 
                    discriminatorType = DiscriminatorType.STRING)
public abstract class ResponsableDePago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Responsable")
    private Integer id;

    @Column(name = "razon_social", length = 100)
    private String razonSocial;
    
    // Asumiendo que las tablas Persona_Fisica y Persona_Juridica referencian a esta.
    
    // Constructores, Getters y Setters
    public ResponsableDePago() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
}
