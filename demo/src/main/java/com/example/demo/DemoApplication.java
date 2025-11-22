package com.example.demo; // Asegúrate que este sea tu paquete real

import com.example.demo.dominio.Habitacion;
import com.example.demo.datos.dao.HabitacionDAO;
import org.springframework.beans.factory.annotation.Autowired;
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
    public CommandLineRunner testDatabase(HabitacionDAO habitacionDAO) {
        return args -> {
            System.out.println("=======================================");
            System.out.println("⚡ INICIANDO PRUEBA DE CONEXIÓN A BD ⚡");
            
            try {
                // Intentamos listar las habitaciones
                // Si esto no da error, la conexión es EXITOSA
                System.out.println("Consultando habitaciones...");
                habitacionDAO.listarTodas(); 
                
                System.out.println("✅ ¡CONEXIÓN EXITOSA! La base de datos responde.");
            } catch (Exception e) {
                System.out.println("❌ ERROR DE CONEXIÓN:");
                System.out.println(e.getMessage());
            }
            System.out.println("=======================================");
        };
    }
}
