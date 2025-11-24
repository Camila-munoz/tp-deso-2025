package com.example.demo.servicios;

import com.example.demo.datos.dao.ConserjeDAO;
import com.example.demo.dominio.Conserje;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GestorConserjes {

    @Autowired
    private ConserjeDAO conserjeDAO;

    public boolean registrar(Conserje c) {
        return conserjeDAO.insertarConserje(c);
    }

    public Optional<Conserje> buscarPorNombre(String nombre) {
        return conserjeDAO.buscarPorNombre(nombre);
    }

    public boolean autenticar(String nombre, String contrasena) throws EntidadNoEncontradaException {
        System.out.println("🔍 Buscando usuario: " + nombre);
        
        Optional<Conserje> conserjeOpt = conserjeDAO.buscarPorNombre(nombre);

        if (conserjeOpt.isPresent()) {
            Conserje conserje = conserjeOpt.get();
            System.out.println("👤 Usuario encontrado: " + conserje.getNombre());
            
            // 2. Verificar coincidencia de contraseña
            if (conserje.getContrasena().equals(contrasena)) {
                return true; // Autenticación exitosa
            } else {
                return false; // Contraseña incorrecta
            }
        } else {
            // El usuario no existe
            throw new EntidadNoEncontradaException("Usuario no encontrado: " + nombre);
        }
    }
    
    // Dejo validarContrasena por si la usas en otro servicio para dar de alta/modificar.
    private boolean validarContrasena(String contrasena) {
        if (contrasena == null || contrasena.length() < 8) {
            System.out.println("❌ Contraseña demasiado corta");
            return false;
        }

        int letras = 0, numeros = 0;
        int[] nums = new int[contrasena.length()];
        int pos = 0;

        for (char c : contrasena.toCharArray()) {
            if (Character.isLetter(c)) letras++;
            if (Character.isDigit(c)) {
                numeros++;
                if (pos < nums.length) {
                    nums[pos++] = Character.getNumericValue(c);
                }
            }
        }

        if (letras < 5 || numeros < 3) {
            System.out.println("❌ Contraseña no cumple requisitos (letras: " + letras + ", números: " + numeros + ")");
            return false;
        }

        // Verificar secuencias
        for (int i = 2; i < pos; i++) {
            int a = nums[i - 2];
            int b = nums[i - 1];
            int c = nums[i];

            if (a == b && b == c) {
                System.out.println("❌ Contraseña tiene 3 números iguales consecutivos");
                return false;
            }
            if (b == a + 1 && c == b + 1) {
                System.out.println("❌ Contraseña tiene secuencia ascendente");
                return false;
            }
            if (b == a - 1 && c == b - 1) {
                System.out.println("❌ Contraseña tiene secuencia descendente");
                return false;
            }
        }

        System.out.println("✅ Contraseña válida");
        return true;
    }
}