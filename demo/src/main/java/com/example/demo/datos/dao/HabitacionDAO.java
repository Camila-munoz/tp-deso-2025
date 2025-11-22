package com.example.demo.datos.dao; // Ajusta a tu paquete real

import com.example.demo.dominio.Habitacion; // Importa tu clase Habitacion
import java.util.List;

public interface HabitacionDAO {
    void guardar(Habitacion habitacion);
    void borrar(Integer id);
    List<Habitacion> listarTodas();
}
