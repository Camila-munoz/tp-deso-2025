package com.example.demo.modelo;

import com.example.demo.modelo.TipoHabitacion;
import jakarta.persistence.*;

@Entity
@Table(name = "Habitacion")
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Habitacion")
    private Integer id;
    
    @Column(name = "numero")
    private String numero;

    @Column(name = "estado")
    @Enumerated(EnumType.STRING)
    private EstadoHabitacion estado;
    
    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "costo") // Mapea 'precio' de Java a 'costo' de la BD
    private Double precio;

    @Column(name = "capacidad")  // ✅ Asegúrate que sea Integer, no int
    private Integer capacidad;   // ✅ Para evitar el mismo problema

    @Column(name = "porcentaje_descuento")
    private Double porcentajeDescuento;

    @ManyToOne
    @JoinColumn(name = "ID_TipoHabitacion") // Esta es la Foreign Key en la BD
    private TipoHabitacion tipo;

    @ManyToOne
    @JoinColumn(name = "ID_Categoria")
    private Categoria categoria;
 
    // CONSTRUCTOR VACÍO
    public Habitacion() {
    }
    

    // GETTERS Y SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNumero() { return numero; }    
    public void setNumero(String numero) { this.numero = numero; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public TipoHabitacion getTipo() { return tipo; }
    public void setTipo(TipoHabitacion tipo) { this.tipo = tipo; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
   
    public EstadoHabitacion getEstado() { return estado; }
    public void setEstado(EstadoHabitacion estado) { this.estado = estado; }
    
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public Double getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(Double porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    @Override
    public String toString() {
        return "Habitacion [id=" + id + ", numero=" + numero + ", precio=" + precio + "]";
    }
}