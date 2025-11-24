package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Entity
@Table(name = "estadias")
public class Estadia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private int cantidadHuespedes; 
    private int cantidadHabitaciones; 
    private int cantidadDias; 
    
    @ManyToOne
    @JoinColumn(name = "id_habitacion")
    private Habitacion habitacion;

    @ManyToOne
    @JoinColumn(name = "id_huesped")
    private Huesped huesped;

    // Usamos LocalDateTime para guardar fecha Y hora (requerido por el TP para check-in 10am)
    private LocalDateTime checkIn; 
    private LocalDateTime checkOut;
    
    // Relaciones
    private CategoriaHabitacion tipoHabitacion; 
    private Integer idReserva; // Para saber de qué reserva viene
    

    // Listas inicializadas para evitar NullPointerException
    private List<Huesped> huespedes = new ArrayList<>();
    private List<Habitacion> habitaciones = new ArrayList<>();

    // CONSTRUCTOR VACÍO
    public Estadia() { }

    // GETTERS Y SETTERS
    
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public int getCantidadHuespedes() { return cantidadHuespedes; }  
    public void setCantidadHuespedes(int cantidadHuespedes) { this.cantidadHuespedes = cantidadHuespedes; }

    public int getCantidadHabitaciones() { return cantidadHabitaciones; }
    public void setCantidadHabitaciones(int cantidadHabitaciones) { this.cantidadHabitaciones = cantidadHabitaciones; }

    public int getCantidadDias() { return cantidadDias; }
    public void setCantidadDias(int cantidadDias) { this.cantidadDias = cantidadDias; }

    public LocalDateTime getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDateTime checkIn) { this.checkIn = checkIn; }

    public LocalDateTime getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDateTime checkOut) { this.checkOut = checkOut; }

    public CategoriaHabitacion getTipoHabitacion() { return tipoHabitacion; }
    public void setTipoHabitacion(CategoriaHabitacion tipoHabitacion) { this.tipoHabitacion = tipoHabitacion; }

    public Integer getIdReserva() { return idReserva; }
    public void setIdReserva(Integer idReserva) { this.idReserva = idReserva; }

    public List<Huesped> getHuespedes() { return huespedes; }
    public void setHuespedes(List<Huesped> huespedes) { this.huespedes = huespedes; }
    
    public List<Habitacion> getHabitaciones() { return habitaciones; }   
    public void setHabitaciones(List<Habitacion> habitaciones) { this.habitaciones = habitaciones; }
}