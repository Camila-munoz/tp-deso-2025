package com.example.demo.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Tarjeta_de_Credito")
public class TarjetaDeCredito {
    
    @Id
    @Column(name = "Numero_tarjeta_Credito", length = 20)
    private String numeroTarjeta;
    
    @Column(name = "saldo", nullable = false, precision = 10, scale = 2)
    private BigDecimal saldo;
    
    @Column(name = "codigo_seguridad", length = 10)
    private String codigoSeguridad; 
    
    @Column(name = "fecha_vencimiento", nullable = false, length = 10)
    private String fechaVencimiento;
    
    @Column(name = "nombre_titular", nullable = false, length = 255)
    private String nombreTitular;
    
    @Column(name = "emisor", length = 100)
    private String emisor;
    
    @Column(name = "limite_credito", precision = 10, scale = 2)
    private BigDecimal limiteCredito;

    public TarjetaDeCredito() {}

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

    public String getEmisor() { 
        return emisor; 
    }
    public void setEmisor(String emisor) { 
        this.emisor = emisor; 
    }

    public BigDecimal getLimiteCredito() { 
        return limiteCredito; 
    }
    public void setLimiteCredito(BigDecimal limiteCredito) { 
        this.limiteCredito = limiteCredito; 
    }
}