package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Efectivo")
public class Efectivo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Efectivo")
    private Integer id;


    public Efectivo() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
}