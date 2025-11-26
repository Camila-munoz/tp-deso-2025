package com.example.demo.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Tarjeta_de_debito")
public class TarjetaDeDebito {
    
    @Id
    @Column(name = "Numero_tarjeta_Debito", length = 20)
    private String numeroTarjeta;
    
    @Column(name = "saldo", nullable = false, precision = 10, scale = 2)
    private BigDecimal saldo;
    
    @Column(name = "codigo_seguridad", length = 10)
    private String codigoSeguridad;
    
    @Column(name = "fecha_vencimiento", nullable = false, length = 10)
    private String fechaVencimiento;
    
    @Column(name = "nombre_titular", nullable = false, length = 255)
    private String nombreTitular;
    
    @Column(name = "banco_asociado", length = 100)
    private String bancoAsociado;
    
    @Column(name = "tipo", length = 20)
    private String tipo;
    
    @Column(name = "numero_cuenta", nullable = false, length = 50)
    private String numeroCuenta;

    public TarjetaDeDebito() {}

    // --- GETTERS Y SETTERS COMPLETOS ---
    
    public String getNumeroTarjeta() { 
        return numeroTarjeta; 
    }
    public void setNumeroTarjeta(String numeroTarjeta) { 
        this.numeroTarjeta = numeroTarjeta; 
    }

    public BigDecimal getSaldo() { 
        return saldo; 
    }
    public void setSaldo(BigDecimal saldo) { 
        this.saldo = saldo; 
    }

    public String getCodigoSeguridad() { 
        return codigoSeguridad; 
    }
    public void setCodigoSeguridad(String codigoSeguridad) { 
        this.codigoSeguridad = codigoSeguridad; 
    }

    public String getFechaVencimiento() { 
        return fechaVencimiento; 
    }
    public void setFechaVencimiento(String fechaVencimiento) { 
        this.fechaVencimiento = fechaVencimiento; 
    }

    public String getNombreTitular() { 
        return nombreTitular; 
    }
    public void setNombreTitular(String nombreTitular) { 
        this.nombreTitular = nombreTitular; 
    }

    public String getBancoAsociado() { 
        return bancoAsociado; 
    }
    public void setBancoAsociado(String bancoAsociado) { 
        this.bancoAsociado = bancoAsociado; 
    }

    public String getTipo() { 
        return tipo; 
    }
    public void setTipo(String tipo) { 
        this.tipo = tipo; 
    }

    public String getNumeroCuenta() { 
        return numeroCuenta; 
    }
    public void setNumeroCuenta(String numeroCuenta) { 
        this.numeroCuenta = numeroCuenta; 
    }
}