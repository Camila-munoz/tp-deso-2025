/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.datos.dao;

import com.example.demo.dominio.Estadia;
import java.util.List;
/**
 *
 * @author I-MAG
 */
public interface EstadiaDAO {
    /**
     * Busca todas las estadías en las que un huésped ha participado.
     * @param tipoDoc Tipo de documento del huésped.
     * @param numDoc Número de documento del huésped.
     * @return Una lista de objetos Estadia. La lista estará vacía si no se encuentran coincidencias.
     */
    List<Estadia> buscarPorHuesped(String tipoDoc, String numDoc);
}
