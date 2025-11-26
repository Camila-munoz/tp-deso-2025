package com.example.demo.repositorios;

import com.example.demo.modelo.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HuespedRepositorio extends JpaRepository<Huesped, Integer> {

    // ✅ CORREGIDO: Usando @Query de JPA con parámetros nombrados
    @Query("SELECT h FROM Huesped h WHERE h.tipoDocumento = :tipo AND h.numeroDocumento = :numero")
    Optional<Huesped> findByDocumento(@Param("tipo") String tipo, @Param("numero") String numero);
}