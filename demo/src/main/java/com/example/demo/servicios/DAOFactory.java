/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.servicios;

import com.example.demo.datos.dao.ConserjeDAO;
import com.example.demo.datos.dao.EstadiaDAO;
import com.example.demo.datos.dao.HuespedDAO;
import com.example.demo.datos.implementacion.ConserjeDAOImpl;
import com.example.demo.datos.implementacion.EstadiaDAOImpl;
import com.example.demo.datos.implementacion.HuespedDAOImpl;

public class DAOFactory {
    public static HuespedDAO getHuespedDAO() {
        return new HuespedDAOImpl();
    }

    public static ConserjeDAO getConserjeDAO() {
        return new ConserjeDAOImpl();
    }
    
    public static EstadiaDAO getEstadiaDAO() {
        return new EstadiaDAOImpl();
    }
}
