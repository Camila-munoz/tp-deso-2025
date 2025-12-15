package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Responsable_De_Pago")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class ResponsableDePago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Responsable")
    private Integer id;

    
    // Constructores, Getters y Setters
    public ResponsableDePago() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

}
