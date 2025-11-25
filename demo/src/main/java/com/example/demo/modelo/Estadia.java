package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "estadias")
public class Estadia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Estadia")
    private Long id;

    @Column(name = "check_in")
    private LocalDateTime checkIn; 

    @Column(name = "check_out")
    private LocalDateTime checkOut;

    @Column(name = "cantidad_huespedes")
    private int cantidadHuespedes; 

    @Column(name = "cantidad_habitaciones")
    private int cantidadHabitaciones; 

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_habitacion")
    private CategoriaHabitacion tipoHabitacion; 
    
    @Column(name = "cantidad_dias")
    private int cantidadDias; 

    @Column(name = "ID_Reserva")
    private Integer idReserva;

    @ManyToMany
    @JoinTable(
        name = "Estadia_Habitaciones", // Nombre de la tabla intermedia en SQL
        joinColumns = @JoinColumn(name = "ID_Estadia"),
        inverseJoinColumns = @JoinColumn(name = "ID_Habitacion")
    )
    private List<Habitacion> habitaciones = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "Estadia_Huespedes", // Nombre de la tabla intermedia en SQL
        joinColumns = @JoinColumn(name = "ID_Estadia"),
        inverseJoinColumns = @JoinColumn(name = "ID_Huesped")
    )
    private List<Huesped> huespedes = new ArrayList<>();

    // CONSTRUCTOR VACÍO
    public Estadia() { }

    // GETTERS Y SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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