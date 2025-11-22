/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.dominio;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

public class Estadia {
    private int id;
    private int cantidad_huesped;
    private int cantidad_habitaciones;
    private CategoriaHabitacion tipo_habitacion;
    private int cantidad_dias;
    private LocalDate check_in;
    private LocalDate check_out;
    private List<Huesped> huespedes;

    private Estadia(Builder builder) {
        this.id = builder.id;
        this.cantidad_huesped = builder.cantidad_huesped;
        this.cantidad_habitaciones = builder.cantidad_habitaciones;
        this.tipo_habitacion = builder.tipo_habitacion;
        this.cantidad_dias = builder.cantidad_dias;
        this.check_in = builder.check_in;
        this.check_out = builder.check_out;
        this.huespedes = builder.huespedes;
    }

    public int getIDEstadia() { return id; } // Ajuste aquí
    public int getCantidad_huesped() { return cantidad_huesped; }
    public int getCantidad_habitaciones() { return cantidad_habitaciones; }
    public CategoriaHabitacion getTipo_habitacion() { return tipo_habitacion; }
    public int getCantidad_dias() { return cantidad_dias; }
    public LocalDate getCheck_in() { return check_in; }
    public LocalDate getCheck_out() { return check_out; }
    public List<Huesped> getHuespedes() { return huespedes; }

   
    public static class Builder {
        private int id;
        private int cantidad_huesped;
        private int cantidad_habitaciones;
        private CategoriaHabitacion tipo_habitacion;
        private int cantidad_dias;
        private LocalDate check_in;
        private LocalDate check_out;
        private List<Huesped> huespedes = new ArrayList<>();

        public Builder setID(int id) {
            this.id = id;
            return this;
        }
        public Builder setCantidadHuesped(int cantidad_huesped) {
            this.cantidad_huesped = cantidad_huesped;
            return this;
        }

        public Builder setCantidadHabitaciones(int cantidad_habitaciones) {
            this.cantidad_habitaciones = cantidad_habitaciones;
            return this;
        }

        public Builder setTipoHabitacion(CategoriaHabitacion tipo_habitacion) {
            this.tipo_habitacion = tipo_habitacion;
            return this;
        }

        public Builder setCantidadDias(int cantidad_dias) {
            this.cantidad_dias = cantidad_dias;
            return this;
        }

        public Builder setCheckIn(LocalDate check_in) {
            this.check_in = check_in;
            return this;
        }

        public Builder setCheckOut(LocalDate check_out) {
            this.check_out = check_out;
            return this;
        }

        public Builder addHuesped(Huesped huesped) {
            this.huespedes.add(huesped);
            return this;
        }

        public Estadia build() {
            return new Estadia(this);
        }
    }
}
