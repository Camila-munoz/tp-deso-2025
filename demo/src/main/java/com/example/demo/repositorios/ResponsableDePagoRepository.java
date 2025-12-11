package com.example.demo.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.modelo.ResponsableDePago;

@Repository
public interface ResponsableDePagoRepository extends JpaRepository<ResponsableDePago, Integer> {
}
