package com.example.demo; 

import com.example.demo.modelo.Habitacion;
import com.example.demo.repositorios.HabitacionRepositorio;

import com.example.demo.repositorios.HabitacionRepositorio;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        // Esta línea es la que ENCIENDE el servidor
        SpringApplication.run(DemoApplication.class, args);
    }

    // --- PRUEBA RÁPIDA DE BASE DE DATOS ---
    @Bean
    public CommandLineRunner testDatabase(HabitacionRepositorio habitacionRepositorio) {
        return args -> {
            System.out.println("=======================================");
            System.out.println("⚡ INICIANDO PRUEBA DE CONEXIÓN A BD ⚡");
            
            try {
                // Intentamos listar las habitaciones
                // Si esto no da error, la conexión es EXITOSA
                System.out.println("Consultando habitaciones...");
                habitacionRepositorio.findAll(); 
                
                System.out.println("✅ ¡CONEXIÓN EXITOSA! La base de datos responde.");
            } catch (Exception e) {
                System.out.println("❌ ERROR DE CONEXIÓN:");
                System.out.println(e.getMessage());
            }
            System.out.println("=======================================");
        };
    }
}
