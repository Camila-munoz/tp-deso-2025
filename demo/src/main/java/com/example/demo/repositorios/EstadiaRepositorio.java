/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.repositorios;

import java.util.List;
import com.example.demo.modelo.Estadia;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadiaRepositorio extends JpaRepository<Estadia, Long> {
    /**
     * Busca todas las estadías en las que un huésped ha participado.
     * @param idHuesped El ID del huésped a buscar.
     * @return Una lista de objetos Estadia. La lista estará vacía si no se encuentran coincidencias.
     */
    List<Estadia> findByHuespedID(long idHuesped);
    
}
