package com.example.demo.servicios;

import com.example.demo.excepciones.ValidacionException;
import com.example.demo.modelo.Conserje;
import com.example.demo.repositorios.ConserjeRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ConserjeService {

    @Autowired
    private ConserjeRepositorio conserjeRepositorio; 

    public boolean registrarConserje(Conserje conserje) throws ValidacionException {
        // Validaciones
        if (conserje.getNombre() == null || conserje.getNombre().trim().isEmpty()) {
            throw new ValidacionException("El nombre es obligatorio");
        }
        
        if (conserje.getContrasena() == null || conserje.getContrasena().trim().isEmpty()) {
            throw new ValidacionException("La contraseña es obligatoria");
        }

        // Verificar si ya existe
        if (conserjeRepositorio.existsByNombre(conserje.getNombre())) {
            throw new ValidacionException("Ya existe un conserje con ese nombre: " + conserje.getNombre());
        }

        // Validar contraseña
        if (!validarContrasena(conserje.getContrasena())) {
            throw new ValidacionException("La contraseña no cumple los requisitos de seguridad");
        }

        try {
            Conserje conserjeGuardado = conserjeRepositorio.save(conserje);
            System.out.println(" Conserje registrado con ID: " + conserjeGuardado.getIdConserje());
            return true;
        } catch (Exception e) {
            System.out.println(" Error al guardar conserje: " + e.getMessage());
            throw new ValidacionException("Error al registrar conserje en la base de datos");
        }
    }

    public boolean autenticar(String nombre, String contrasena) {
        Optional<Conserje> conserjeOpt = conserjeRepositorio.findByNombre(nombre);
        
        if (conserjeOpt.isPresent()) {
            Conserje conserje = conserjeOpt.get();
            boolean coincide = conserje.getContrasena().equals(contrasena);
            System.out.println(" Autenticación " + (coincide ? "exitosa" : "fallida") + " para: " + nombre);
            return coincide;
        }
        
        System.out.println(" Usuario no encontrado: " + nombre);
        return false;
    }

    public Optional<Conserje> buscarPorNombre(String nombre) {
        return conserjeRepositorio.findByNombre(nombre);
    }

    public List<Conserje> listarTodos() {
        return conserjeRepositorio.findAll();
    }

    public void eliminarConserje(Integer id) {
        if (conserjeRepositorio.existsById(id)) {
            conserjeRepositorio.deleteById(id);
            System.out.println(" Conserje eliminado con ID: " + id);
        } else {
            throw new RuntimeException("Conserje no encontrado con ID: " + id);
        }
    }

    public Optional<Conserje> buscarPorId(Integer id) {
        return conserjeRepositorio.findById(id);
    }

    private boolean validarContrasena(String contrasena) {
        if (contrasena == null || contrasena.length() < 8) {
            return false;
        }

        int letras = 0, numeros = 0;
        
        for (char c : contrasena.toCharArray()) {
            if (Character.isLetter(c)) letras++;
            if (Character.isDigit(c)) numeros++;
        }

        if (letras < 5 || numeros < 3) {
            return false;
        }

        // Validación de secuencias (simplificada)
        for (int i = 2; i < contrasena.length(); i++) {
            char a = contrasena.charAt(i-2);
            char b = contrasena.charAt(i-1);
            char c = contrasena.charAt(i);
            
            if (Character.isDigit(a) && Character.isDigit(b) && Character.isDigit(c)) {
                int numA = Character.getNumericValue(a);
                int numB = Character.getNumericValue(b);
                int numC = Character.getNumericValue(c);
                
                if (numA == numB && numB == numC) return false;
                if (numB == numA + 1 && numC == numB + 1) return false;
                if (numB == numA - 1 && numC == numB - 1) return false;
            }
        }

        return true;
    }
}