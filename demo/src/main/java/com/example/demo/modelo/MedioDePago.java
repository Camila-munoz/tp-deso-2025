package com.example.demo.modelo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Medio_de_Pago")
public class MedioDePago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Medio_de_Pago")
    private Integer id;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_de_pago")
    private LocalDateTime fechaDePago;

    // Relación ManyToOne con Pago (FK: ID_Pago)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Pago", nullable = false)
    private Pago pago;

    // --- Relaciones Opcionales OneToOne (Subtipos) ---
    // Usamos @OneToOne para mapear el subtipo. Todas son nullable = true (NULL)
    // ya que solo puede ser un tipo de pago.

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_efectivo", unique = true)
    private Efectivo efectivo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Numero_tarjeta_Credito", unique = true)
    private TarjetaDeCredito tarjetaCredito; // Asumiendo clase TarjetaDeCredito

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Numero_tarjeta_Debito", unique = true)
    private TarjetaDeDebito tarjetaDebito; // Asumiendo clase TarjetaDeDebito

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Moneda_Extranjera", unique = true)
    private MonedaExtranjera monedaExtranjera; // Asumiendo clase MonedaExtranjera

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Numero_cheque_tercero", unique = true)
    private ChequeTercero chequeTercero; // Asumiendo clase ChequeTercero

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Numero_cheque_propio", unique = true)
    private ChequePropio chequePropio; // Asumiendo clase ChequePropio

    // Constructores, Getters y Setters
    public MedioDePago() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public LocalDateTime getFechaDePago() { return fechaDePago; }
    public void setFechaDePago(LocalDateTime fechaDePago) { this.fechaDePago = fechaDePago; }

    public Pago getPago() { return pago; }
    public void setPago(Pago pago) { this.pago = pago; }

    public Efectivo getEfectivo() { return efectivo; }
    public void setEfectivo(Efectivo efectivo) { this.efectivo = efectivo; }

    public TarjetaDeCredito getTarjetaCredito() { return tarjetaCredito; }
    public void setTarjetaCredito(TarjetaDeCredito tarjetaCredito) { this.tarjetaCredito = tarjetaCredito; }

    public TarjetaDeDebito getTarjetaDebito() { return tarjetaDebito; }
    public void setTarjetaDebito(TarjetaDeDebito tarjetaDebito) { this.tarjetaDebito = tarjetaDebito; }

    public MonedaExtranjera getMonedaExtranjera() { return monedaExtranjera; }
    public void setMonedaExtranjera(MonedaExtranjera monedaExtranjera) { this.monedaExtranjera = monedaExtranjera; }

    public ChequeTercero getChequeTercero() { return chequeTercero; }
    public void setChequeTercero(ChequeTercero chequeTercero) { this.chequeTercero = chequeTercero; }

    public ChequePropio getChequePropio() { return chequePropio; }
    public void setChequePropio(ChequePropio chequePropio) { this.chequePropio = chequePropio; }
}