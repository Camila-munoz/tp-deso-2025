package com.example.demo.repositorios;

import com.example.demo.modelo.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepositorio extends JpaRepository<Factura, Integer> {

    // Buscar todas las facturas por el ID de la estadía (HQL basado en la relación Estadia)
    List<Factura> findByEstadia_Id(Integer estadiaId);

    // Buscar facturas por ID y estado
    Optional<Factura> findByIdAndEstado(Integer id, String estado);
}