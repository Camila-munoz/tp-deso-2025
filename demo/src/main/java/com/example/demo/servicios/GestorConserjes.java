/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.servicios;

import com.example.demo.datos.dao.ConserjeDAO;
import com.example.demo.dominio.Conserje;
import com.example.demo.excepciones.EntidadNoEncontradaException;
import java.util.Optional;

public class GestorConserjes {

    private static GestorConserjes instancia;
    private final ConserjeDAO conserjeDAO;

    private GestorConserjes() {
        this.conserjeDAO = DAOFactory.getConserjeDAO();
    }

    public static GestorConserjes getInstancia() {
        if (instancia == null) {
            instancia = new GestorConserjes();
        }
        return instancia;
    }

    /**
     * Autentica un usuario verificando su nombre y contraseña.
     * @param nombre El nombre de usuario.
     * @param contrasena La contraseña.
     * @return true si la autenticación es exitosa, false en caso contrario.
     * @throws EntidadNoEncontradaException si el usuario no existe en el sistema.
     */
    public boolean autenticar(String nombre, String contrasena) throws EntidadNoEncontradaException {
        Optional<Conserje> conserjeOpt = conserjeDAO.buscarPorNombre(nombre);
        
        if (conserjeOpt.isPresent() & validarContrasena(contrasena)) {
            return conserjeOpt.get().getContrasenia().equals(contrasena);
        } else {
            throw new EntidadNoEncontradaException("El usuario o la contraseña no son válidos");
        }
    }
    private boolean validarContrasena(String contrasena) {
    if (contrasena.length() < 8) return false;

    int letras = 0;
    int numeros = 0;
    int[] nums = new int[contrasena.length()];
    int pos = 0;

    for (char c : contrasena.toCharArray()) {
        if (Character.isLetter(c)) letras++;
        if (Character.isDigit(c)) {
            numeros++;
            nums[pos++] = Character.getNumericValue(c);
        }
    }

    // Verificar si hay al menos 5 letras y 3 números
    if (letras < 5 || numeros < 3) return false;

    // Verificar que no haya 3 números iguales o consecutivos (creciente o decreciente)
    for (int i = 2; i < pos; i++) {
        int a = nums[i - 2];
        int b = nums[i - 1];
        int c = nums[i];

        // Tres iguales
        if (a == b && b == c) return false;

        // Tres consecutivos en orden creciente (p.ej. 1,2,3)
        if (b == a + 1 && c == b + 1) return false;

        // Tres consecutivos en orden decreciente (p.ej. 3,2,1)
        if (b == a - 1 && c == b - 1) return false;
    }

    return true;
}
}
