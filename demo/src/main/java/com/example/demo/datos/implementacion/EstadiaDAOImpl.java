package com.example.demo.datos.implementacion;

import com.example.demo.datos.dao.EstadiaDAO;
import com.example.demo.dominio.Estadia;
import com.example.demo.dominio.Huesped;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class EstadiaDAOImpl implements EstadiaDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // --- 1. IMPLEMENTACIÓN DE GUARDAR (CU15) ---
    @Override
    public void guardar(Estadia estadia) {
        // Guardamos la estadía principal
        String sqlEstadia = "INSERT INTO Estadia (check_in, check_out, cantidad_dias, cantidad_huespedes, cantidad_habitaciones, ID_Reserva, ID_Habitacion) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        jdbcTemplate.update(sqlEstadia,
            Timestamp.valueOf(estadia.getCheckIn()), // LocalDateTime a Timestamp
            estadia.getCheckOut() != null ? Timestamp.valueOf(estadia.getCheckOut()) : null,
            estadia.getCantidadDias(),
            estadia.getCantidadHuespedes(),
            estadia.getCantidadHabitaciones(),
            estadia.getIdReserva(),
            // Asumiendo que guardamos al menos una habitación (toma la primera de la lista o null)
            !estadia.getHabitaciones().isEmpty() ? estadia.getHabitaciones().get(0).getId() : null 
        );

        // Opcional: Aquí deberías guardar la relación con los huéspedes en la tabla intermedia
        // pero para simplificar, primero asegura que compile esto.
    }

    // --- 2. IMPLEMENTACIÓN DE LISTAR TODAS (El que te faltaba) ---
    @Override
    public List<Estadia> listarTodas() {
        String sql = "SELECT * FROM Estadia";
        return jdbcTemplate.query(sql, new EstadiaRowMapper());
    }

    // --- 3. ROW MAPPER (Necesario para listar) ---
    private class EstadiaRowMapper implements RowMapper<Estadia> {
        @Override
        public Estadia mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
            Estadia estadia = new Estadia();
            estadia.setId(rs.getInt("ID_Estadia"));
            // Conversión de SQL Timestamp a Java LocalDateTime
            if (rs.getTimestamp("check_in") != null) {
                estadia.setCheckIn(rs.getTimestamp("check_in").toLocalDateTime());
            }
            if (rs.getTimestamp("check_out") != null) {
                estadia.setCheckOut(rs.getTimestamp("check_out").toLocalDateTime());
            }
            estadia.setCantidadDias(rs.getInt("cantidad_dias"));
            estadia.setCantidadHuespedes(rs.getInt("cantidad_huespedes"));
            
            return estadia;
        }
    }
    // --- 4. IMPLEMENTACIÓN DE BUSCAR POR HUÉSPED (El que te falta) ---
    @Override
    public List<Estadia> buscarPorHuesped(String tipoDoc, String nroDoc) {
        // Hacemos un JOIN: Estadia -> Reserva -> Huesped
        // Buscamos las estadías asociadas a las reservas de ese huésped
        String sql = """
            SELECT e.* FROM Estadia e
            INNER JOIN Reserva r ON e.ID_Reserva = r.ID_Reserva
            INNER JOIN Huesped h ON r.ID_Huesped = h.ID_Huesped
            WHERE h.tipo_documento = ? AND h.nro_documento = ?
        """;

        return jdbcTemplate.query(sql, new EstadiaRowMapper(), tipoDoc, nroDoc);
    }
}
