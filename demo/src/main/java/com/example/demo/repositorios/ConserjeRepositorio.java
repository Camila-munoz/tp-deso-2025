/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.repositorios;

import com.example.demo.modelo.Conserje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;



public interface ConserjeRepositorio extends JpaRepository<Conserje, Long> {
    Optional<Conserje> findByUsuario(String usuario);
}
