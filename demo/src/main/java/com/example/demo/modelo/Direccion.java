package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Direccion")
public class Direccion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Direccion")
    private Integer id;
   
    @Column(name = "calle")
    private String calle;
    
    @Column(name = "numero")
    private int numero;
    
    @Column(name = "departamento")
    private String departamento;
    
    @Column(name = "piso")
    private Integer piso;
    
    @Column(name = "cod_postal")
    private String codPostal;
    
    @Column(name = "localidad")
    private String localidad;
    
    @Column(name = "provincia")
    private String provincia;
    
    @Column(name = "pais")
    private String pais;

    // CONSTRUCTOR VACÍO 
    public Direccion() {
    }

    // GETTERS Y SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }

    public int getNumero() { return numero; }
    public void setNumero(int numero) { this.numero = numero; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public Integer getPiso() { return piso; }
    public void setPiso(Integer piso) { this.piso = piso; }

    public String getCodPostal() { return codPostal; }
    public void setCodPostal(String codPostal) { this.codPostal = codPostal; }

    public String getLocalidad() { return localidad; }
    public void setLocalidad(String localidad) { this.localidad = localidad; }

    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    @Override
    public String toString() {
        return String.format("%s %d, %s, %s, %s, %s", calle, numero, localidad, provincia, pais, codPostal);
    }
}