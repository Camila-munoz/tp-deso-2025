/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.repositorios;

import com.example.demo.modelo.Huesped;
import com.example.demo.modelo.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

public interface HuespedRepositorio extends JpaRepository<Huesped, Long> {
    Optional<Huesped> findByDocumento(String tipoDoc, String numDoc);
}
