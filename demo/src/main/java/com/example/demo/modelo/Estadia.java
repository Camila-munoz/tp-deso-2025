package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Estadia")
public class Estadia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Estadia")
    private Integer id;

    @Column(name = "cantidad_huespedes")
    private int cantidadHuespedes; 
    
    @Column(name = "cantidad_habitaciones")
    private int cantidadHabitaciones; 
    
    @Column(name = "cantidad_dias")
    private int cantidadDias; 

    @Column(name = "check_in")
    private LocalDateTime checkIn; 
    
    @Column(name = "check_out")
    private LocalDateTime checkOut;
    
    @ManyToOne
    @JoinColumn(name = "ID_Habitacion")
    private Habitacion habitacion;


    @Column(name = "ID_Reserva") 
    private Integer idReserva;

    @ManyToOne
    @JoinColumn(name = "ID_Huesped")
    private Huesped huesped;

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

    public Habitacion getHabitacion() { return habitacion; }
    public void setHabitacion(Habitacion habitacion) { this.habitacion = habitacion; }

    public LocalDateTime getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDateTime checkIn) { this.checkIn = checkIn; }

    public LocalDateTime getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDateTime checkOut) { this.checkOut = checkOut; }

    public Integer getIdReserva() { return idReserva; }
    public void setIdReserva(Integer idReserva) { this.idReserva = idReserva; }

    public Huesped getHuesped() { return huesped; }
    public void setHuesped(Huesped huesped) { this.huesped = huesped; }
}