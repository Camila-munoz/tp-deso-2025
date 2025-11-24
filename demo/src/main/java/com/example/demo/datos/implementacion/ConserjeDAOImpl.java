package com.example.demo.datos.implementacion;

import com.example.demo.datos.dao.ConserjeDAO;
import com.example.demo.dominio.Conserje;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;

@Repository
public class ConserjeDAOImpl implements ConserjeDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public Optional<Conserje> buscarPorNombre(String nombre) {
        String sql = "SELECT ID_Conserje, nombre, contrasena FROM Conserje WHERE nombre = ?";


        try {
            Conserje conserje = jdbcTemplate.queryForObject(sql,
                    new Object[]{nombre},
                    (rs, rowNum) -> {
                        Conserje c = new Conserje();
                        c.setIdConserje(rs.getInt("ID_Conserje"));
                        c.setNombre(rs.getString("nombre"));
                        c.setContrasena(rs.getString("contrasena"));
                        return c;
                    });
            return Optional.of(conserje);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean insertarConserje(Conserje c) {
        String sql = "INSERT INTO Conserje(nombre, contrasena) VALUES(?, ?)";


        return jdbcTemplate.update(sql,
                c.getNombre(),
                c.getContrasena()
        ) > 0;
    }
}
