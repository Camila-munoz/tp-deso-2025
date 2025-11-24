package com.example.demo.repositorios;

import java.util.List;
import com.example.demo.modelo.Estadia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadiaRepositorio extends JpaRepository<Estadia, Integer> {
    
    @Query("SELECT e FROM Estadia e WHERE e.huesped.id = :idHuesped")
    List<Estadia> findByHuespedID(@Param("idHuesped") Integer idHuesped);
}