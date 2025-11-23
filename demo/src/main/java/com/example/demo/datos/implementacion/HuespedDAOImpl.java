package com.example.demo.datos.implementacion; // Ajusta a tu paquete

import com.example.demo.datos.dao.HuespedDAO;
import com.example.demo.dominio.Huesped;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date; // Para las fechas
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.sql.Statement;
import java.sql.PreparedStatement;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

@Repository
public class HuespedDAOImpl implements HuespedDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void guardar(Huesped h) {
        // 1. PRIMERO GUARDAMOS LA DIRECCIÓN (Si tiene)
        Integer idDireccion = null;
        
        if (h.getDireccion() != null) {
            String sqlDir = "INSERT INTO Direccion (calle, numero, piso, departamento, cod_postal, localidad, provincia, pais) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            KeyHolder keyHolder = new GeneratedKeyHolder();
            
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sqlDir, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, h.getDireccion().getCalle());
                // Convertimos int a String para la BD
                ps.setString(2, String.valueOf(h.getDireccion().getNumero())); 
                ps.setString(3, String.valueOf(h.getDireccion().getPiso()));
                
                ps.setString(4, h.getDireccion().getDepartamento());
                ps.setString(5, h.getDireccion().getCodPostal());
                ps.setString(6, h.getDireccion().getLocalidad());
                ps.setString(7, h.getDireccion().getProvincia());
                ps.setString(8, h.getDireccion().getPais());
                return ps;
            }, keyHolder);
            
            idDireccion = keyHolder.getKey().intValue();
        }

        // 2. AHORA GUARDAMOS EL HUÉSPED
        String sqlHuesped = "INSERT INTO Huesped (tipo_documento, nro_documento, nombre, apellido, email, telefono, nacionalidad, ocupacion, fecha_nacimiento, posicion_IVA, ID_Direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        jdbcTemplate.update(sqlHuesped,
            h.getTipoDocumento(),
            h.getNumeroDocumento(),
            h.getNombre(),
            h.getApellido(),
            h.getEmail(),
            h.getTelefono(),
            h.getNacionalidad(),
            h.getOcupacion(),
            h.getFechaNacimiento() != null ? Date.valueOf(h.getFechaNacimiento()) : null,
            h.getPosicionIVA(),
            idDireccion
        );
    }

    @Override
    public Optional<Huesped> buscarPorDocumento(String tipoDoc, String numDoc) {
        String sql = "SELECT * FROM Huesped WHERE tipo_documento = ? AND nro_documento = ?";
        try {
            // Usamos un 'RowMapper' lambda para convertir la fila de DB a Objeto Java
            Huesped huesped = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Huesped h = new Huesped();
                h.setTipoDocumento(rs.getString("tipo_documento"));
                h.setNumeroDocumento(rs.getString("nro_documento"));
                h.setNombre(rs.getString("nombre"));
                h.setApellido(rs.getString("apellido"));
                h.setEmail(rs.getString("email"));
                h.setTelefono(rs.getString("telefono"));
                h.setNacionalidad(rs.getString("nacionalidad"));
                h.setOcupacion(rs.getString("ocupacion"));
                if (rs.getDate("fecha_nacimiento") != null) {
                    h.setFechaNacimiento(rs.getDate("fecha_nacimiento").toLocalDate());
                }
                return h;
            }, tipoDoc, numDoc);
            
            return Optional.of(huesped);
        } catch (Exception e) {
            return Optional.empty(); // Si no lo encuentra, devuelve vacío
        }
    }

    // Implementaciones vacías o básicas para cumplir con la interfaz por ahora
    @Override
    public List<Huesped> buscarTodos() { return List.of(); } 
    @Override
    public void actualizar(Huesped huesped) {}
    @Override
    public void eliminar(String tipoDoc, String numDoc) {}
    @Override
    public List<Huesped> buscarPor(Predicate<Huesped> filtro) { return List.of(); }
}