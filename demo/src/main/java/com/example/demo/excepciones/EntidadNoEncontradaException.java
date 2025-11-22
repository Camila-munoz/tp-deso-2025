/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Exception.java to edit this template
 */
package com.example.demo.excepciones;

/**
 *
 * @author I-MAG
 */
public class EntidadNoEncontradaException extends Exception {

    /**
     * Creates a new instance of <code>EntidadNoEncontradaException</code>
     * without detail message.
     */
    public EntidadNoEncontradaException() {
    }

    /**
     * Constructs an instance of <code>EntidadNoEncontradaException</code> with
     * the specified detail message.
     *
     * @param msg the detail message.
     */
    public EntidadNoEncontradaException(String msg) {
        super(msg);
    }
}
