package com.example.demo.repositorios;

import com.example.demo.modelo.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HuespedRepositorio extends JpaRepository<Huesped, Integer> {

    @Query("SELECT h FROM Huesped h WHERE h.tipoDocumento = :tipo AND h.numeroDocumento = :numero")
    Optional<Huesped> findByDocumento(@Param("tipo") String tipo, @Param("numero") String numero);

    // --- CORRECCIÓN: "EMPIEZA CON" ---
    // Se cambia LIKE %:var% por LIKE CONCAT(:var, '%')
    @Query("SELECT h FROM Huesped h " +
       "WHERE (:apellido IS NULL OR :apellido = '' OR h.apellido LIKE CONCAT(:apellido, '%')) " +
       "AND (:nombre IS NULL OR :nombre = '' OR h.nombre LIKE CONCAT(:nombre, '%')) " +
       "AND (:tipoDoc IS NULL OR h.tipoDocumento = :tipoDoc) " +
       "AND (:numDoc IS NULL OR :numDoc = '' OR h.numeroDocumento = :numDoc)")
    List<Huesped> buscarPorCriterios(
        @Param("apellido") String apellido,
        @Param("nombre") String nombre,
        @Param("tipoDoc") String tipoDoc,
        @Param("numDoc") String numDoc
    );

    @Query("SELECT h FROM Huesped h WHERE h.estadia.id = :idEstadia")
    Optional<Huesped> findByEstadiaId(@Param("idEstadia") Integer idEstadia);
}