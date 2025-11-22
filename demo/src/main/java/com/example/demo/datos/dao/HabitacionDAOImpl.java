package com.example.demo.datos.dao; // Ajusta a tu paquete real

import com.example.demo.dominio.Habitacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository // ¡Obligatorio!
public class HabitacionDAOImpl implements HabitacionDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void guardar(Habitacion habitacion) {
        // Asegúrate que estos nombres coincidan con TU base de datos
        String sql = "INSERT INTO habitacion (numero, tipo, precio_diario, estado) VALUES (?, ?, ?, ?)";
        
        jdbcTemplate.update(sql, 
            habitacion.getNumero(), 
            habitacion.getTipo(), 
            habitacion.getPrecio(), // O getPrecioDiario() según tu clase
            "DISPONIBLE"            // Valor por defecto o habitacion.getEstado()
        );
    }

    @Override
    public void borrar(Integer id) {
        String sql = "DELETE FROM habitacion WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    @Override
    public List<Habitacion> listarTodas() {
        String sql = "SELECT * FROM habitacion";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Habitacion h = new Habitacion();
            // Mapeamos la columna de la BD al atributo de la clase
            h.setId(rs.getInt("id"));
            h.setNumero(rs.getString("numero"));
            h.setTipo(rs.getString("tipo"));
            h.setPrecio(rs.getDouble("precio_diario"));
            // h.setEstado(rs.getString("estado"));
            return h;
        });
    }
}