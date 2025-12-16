package com.example.demo.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.demo.modelo.Conserje;
import java.util.Optional;

@Repository
public interface ConserjeRepositorio extends JpaRepository<Conserje, Integer> {
    
    // Spring Data JPA genera automáticamente la consulta
    Optional<Conserje> findByNombre(String nombre);
    
    // Consulta personalizada CORRECTA (opcional)
    @Query("SELECT c FROM Conserje c WHERE c.nombre = :nombre")
    Optional<Conserje> buscarPorNombre(@Param("nombre") String nombre);
    
    // Verificar si existe un conserje con ese nombre
    boolean existsByNombre(String nombre);
}
