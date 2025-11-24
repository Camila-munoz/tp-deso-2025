package com.example.demo.servicios;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.demo.excepciones.EntidadNoEncontradaException;
import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Conserje;
import com.example.demo.repositorios.ConserjeRepositorio;

import java.util.Optional;

@Service
public class ConserjeService {

    @Autowired
    private ConserjeRepositorio conserjeRepositorio;

    public Conserje autenticarUsuario(String usuario, String contrasenia) throws ValidacionException, EntidadNoEncontradaException {
        Optional<Conserje> conserjeOpt = conserjeRepositorio.findByUsuario(usuario);

        if (conserjeOpt.isEmpty()) {
            throw new EntidadNoEncontradaException("El usuario no existe");
        }

        Conserje conserje = conserjeOpt.get();

        if (!conserje.getContrasenia().equals(contrasenia)) {
            throw new ValidacionException("Contraseña incorrecta");
        }

        return conserje;
    }
}
