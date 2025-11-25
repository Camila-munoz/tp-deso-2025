package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reserva") // Asegúrate que coincida con tu SQL (mayúsculas/minúsculas)
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Reserva")
    private Long id;

    @Column(name = "fecha_entrada", nullable = false)
    private LocalDate fechaEntrada;

    @Column(name = "fecha_salida", nullable = false)
    private LocalDate fechaSalida;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_reserva")
    private EstadoReserva estado;

    // Relación con Huésped (Quien hace la reserva)
    @ManyToOne
    @JoinColumn(name = "ID_Huesped", nullable = false)
    private Huesped huesped;

    // Relación con Habitaciones (Una reserva puede incluir varias habitaciones)
    @ManyToMany
    @JoinTable(
        name = "Reserva_Habitacion", // Tabla intermedia del SQL
        joinColumns = @JoinColumn(name = "ID_Reserva"),
        inverseJoinColumns = @JoinColumn(name = "ID_Habitacion")
    )
    private List<Habitacion> habitaciones = new ArrayList<>();

    public Reserva() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getFechaEntrada() { return fechaEntrada; }
    public void setFechaEntrada(LocalDate fechaEntrada) { this.fechaEntrada = fechaEntrada; }

    public LocalDate getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(LocalDate fechaSalida) { this.fechaSalida = fechaSalida; }
   
    public EstadoReserva getEstado() { return estado; }
    public void setEstado(EstadoReserva estado) { this.estado = estado; }
   
    public Huesped getHuesped() { return huesped; }
    public void setHuesped(Huesped huesped) { this.huesped = huesped; }
    
    public List<Habitacion> getHabitaciones() { return habitaciones; }
    public void setHabitaciones(List<Habitacion> habitaciones) { this.habitaciones = habitaciones; }
}