/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.datos.dao;

import com.example.demo.dominio.Conserje;
import java.util.Optional;

/**
 *
 * @author I-MAG
 */
public interface ConserjeDAO {
    Optional<Conserje> buscarPorNombre(String nombre);
}
