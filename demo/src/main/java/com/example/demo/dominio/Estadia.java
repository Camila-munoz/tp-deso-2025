package com.example.demo.dominio;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Estadia {
    private Integer id;
    private int cantidadHuespedes; // Antes cantidad_huesped
    private int cantidadHabitaciones; // Antes cantidad_habitaciones
    private int cantidadDias; // Antes cantidad_dias
    
    // Usamos LocalDateTime para guardar fecha Y hora (requerido por el TP para check-in 10am)
    private LocalDateTime checkIn; 
    private LocalDateTime checkOut;
    
    // Relaciones
    private CategoriaHabitacion tipoHabitacion; 
    private Integer idReserva; // Para saber de qué reserva viene
    
    // Listas inicializadas para evitar NullPointerException
    private List<Huesped> huespedes = new ArrayList<>();
    private List<Habitacion> habitaciones = new ArrayList<>();

    // 1. CONSTRUCTOR VACÍO (OBLIGATORIO)
    public Estadia() {
    }

    // 2. GETTERS Y SETTERS (OBLIGATORIOS PARA EL DAO)
    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getCantidadHuespedes() {
        return cantidadHuespedes;
    }

    public void setCantidadHuespedes(int cantidadHuespedes) {
        this.cantidadHuespedes = cantidadHuespedes;
    }

    public int getCantidadHabitaciones() {
        return cantidadHabitaciones;
    }

    public void setCantidadHabitaciones(int cantidadHabitaciones) {
        this.cantidadHabitaciones = cantidadHabitaciones;
    }

    public int getCantidadDias() {
        return cantidadDias;
    }

    public void setCantidadDias(int cantidadDias) {
        this.cantidadDias = cantidadDias;
    }

    public LocalDateTime getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDateTime checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDateTime getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDateTime checkOut) {
        this.checkOut = checkOut;
    }

    public CategoriaHabitacion getTipoHabitacion() {
        return tipoHabitacion;
    }

    public void setTipoHabitacion(CategoriaHabitacion tipoHabitacion) {
        this.tipoHabitacion = tipoHabitacion;
    }

    public Integer getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Integer idReserva) {
        this.idReserva = idReserva;
    }

    public List<Huesped> getHuespedes() {
        return huespedes;
    }

    public void setHuespedes(List<Huesped> huespedes) {
        this.huespedes = huespedes;
    }
    
    public List<Habitacion> getHabitaciones() {
        return habitaciones;
    }

    public void setHabitaciones(List<Habitacion> habitaciones) {
        this.habitaciones = habitaciones;
    }
}