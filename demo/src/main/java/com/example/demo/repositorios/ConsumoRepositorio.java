package com.example.demo.repositorios;

import com.example.demo.modelo.Consumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConsumoRepositorio extends JpaRepository<Consumo, Integer> {
    List<Consumo> findByEstadia_Id(Integer idEstadia);

    @Query("SELECT c FROM Consumo c WHERE c.estadia.id = :estadiaId")
    List<Consumo> findByEstadiaId(@Param("estadiaId") Integer estadiaId);
}
