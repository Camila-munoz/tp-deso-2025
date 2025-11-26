package com.example.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Cheque_Propio")
public class ChequePropio {
    
    @Id
    @Column(name = "Numero_cheque_propio", length = 50)
    private String numeroCheque;
    
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;
    
    @Column(name = "banco", nullable = false, length = 100)
    private String banco;
    
    @Column(name = "beneficiario", nullable = false, length = 255)
    private String beneficiario;

    public ChequePropio() {}

    // Getters y Setters
    public String getNumeroCheque() { return numeroCheque; }
    public void setNumeroCheque(String numeroCheque) { this.numeroCheque = numeroCheque; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getBanco() { return banco; }
    public void setBanco(String banco) { this.banco = banco; }
    public String getBeneficiario() { return beneficiario; }
    public void setBeneficiario(String beneficiario) { this.beneficiario = beneficiario; }
}
