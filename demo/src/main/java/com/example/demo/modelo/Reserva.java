package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Reserva")
    private Integer id; // Usamos Integer para coincidir con tus otros modelos

    @Column(name = "estado_reserva")
    @Enumerated(EnumType.STRING)
    private EstadoReserva estado;

    @Column(name = "fecha_entrada", nullable = false)
    private LocalDate fechaEntrada;

    @Column(name = "fecha_salida", nullable = false)
    private LocalDate fechaSalida;

    // Relación con el Huésped titular
    @ManyToOne
    @JoinColumn(name = "ID_Huesped", nullable = false)
    private Huesped huesped;

    // Relación Muchos a Muchos con Habitaciones (según tu tabla Reserva_Habitacion)
    @ManyToMany
    @JoinTable(
        name = "Reserva_Habitacion", 
        joinColumns = @JoinColumn(name = "ID_Reserva"),
        inverseJoinColumns = @JoinColumn(name = "ID_Habitacion")
    )
    private List<Habitacion> habitaciones = new ArrayList<>();

    public Reserva() {}

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public EstadoReserva getEstado() { return estado; }
    public void setEstado(EstadoReserva estado) { this.estado = estado; }

    public LocalDate getFechaEntrada() { return fechaEntrada; }
    public void setFechaEntrada(LocalDate fechaEntrada) { this.fechaEntrada = fechaEntrada; }

    public LocalDate getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(LocalDate fechaSalida) { this.fechaSalida = fechaSalida; }

    public Huesped getHuesped() { return huesped; }
    public void setHuesped(Huesped huesped) { this.huesped = huesped; }

    public List<Habitacion> getHabitaciones() { return habitaciones; }
    public void setHabitaciones(List<Habitacion> habitaciones) { this.habitaciones = habitaciones; }
}