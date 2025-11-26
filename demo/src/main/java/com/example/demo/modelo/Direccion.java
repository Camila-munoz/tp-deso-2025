package com.example.demo.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "Direccion")
public class Direccion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Direccion")
    private Integer id;
   
    @Column(name = "calle", nullable = false)
    private String calle;
    
    @Column(name = "numero", nullable = false)
    private int numero;
    
    @Column(name = "departamento")
    private String departamento;
    
    @Column(name = "piso")
    private Integer piso;
    
    @Column(name = "cod_postal", nullable = false)
    private String codPostal;
    
    @Column(name = "localidad", nullable = false)
    private String localidad;
    
    @Column(name = "provincia", nullable = false)
    private String provincia;
    
    @Column(name = "pais", nullable = false)
    private String pais;

    // 1. CONSTRUCTOR VACÍO (NECESARIO PARA JPA)
    public Direccion() {
    }

    // 2. CONSTRUCTOR COMPLETO
    public Direccion(String calle, int numero, String departamento, Integer piso, 
                    String codPostal, String localidad, String provincia, String pais) {
        this.calle = calle;
        this.numero = numero;
        this.departamento = departamento;
        this.piso = piso;
        this.codPostal = codPostal;
        this.localidad = localidad;
        this.provincia = provincia;
        this.pais = pais;
    }

    // 3. CONSTRUCTOR SIMPLIFICADO (sin departamento y piso)
    public Direccion(String calle, int numero, String codPostal, String localidad, String provincia, String pais) {
        this.calle = calle;
        this.numero = numero;
        this.codPostal = codPostal;
        this.localidad = localidad;
        this.provincia = provincia;
        this.pais = pais;
    }

    // 4. GETTERS Y SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }

    public int getNumero() { return numero; }
    public void setNumero(int numero) { this.numero = numero; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public Integer getPiso() { return piso; }
    public void setPiso(Integer piso) { this.piso = piso; }

    public String getCodPostal() { return codPostal; }
    public void setCodPostal(String codPostal) { this.codPostal = codPostal; }

    public String getLocalidad() { return localidad; }
    public void setLocalidad(String localidad) { this.localidad = localidad; }

    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    @Override
    public String toString() {
        return String.format("%s %d, %s, %s, %s, %s", calle, numero, localidad, provincia, pais, codPostal);
    }

    // 5. BUILDER PATTERN (opcional, pero útil)
    public static class Builder {
        private String calle;
        private int numero;
        private String departamento;
        private Integer piso;
        private String codPostal;
        private String localidad;
        private String provincia;
        private String pais;

        public Builder calle(String calle) { 
            this.calle = calle; 
            return this; 
        }
        
        public Builder numero(int numero) { 
            this.numero = numero; 
            return this; 
        }
        
        public Builder departamento(String departamento) { 
            this.departamento = departamento; 
            return this; 
        }
        
        public Builder piso(Integer piso) { 
            this.piso = piso; 
            return this; 
        }
        
        public Builder codPostal(String codPostal) { 
            this.codPostal = codPostal; 
            return this; 
        }
        
        public Builder localidad(String localidad) { 
            this.localidad = localidad; 
            return this; 
        }
        
        public Builder provincia(String provincia) { 
            this.provincia = provincia; 
            return this; 
        }
        
        public Builder pais(String pais) { 
            this.pais = pais; 
            return this; 
        }

        public Direccion build() { 
            return new Direccion(calle, numero, departamento, piso, codPostal, localidad, provincia, pais); 
        }
    }

    // 6. MÉTODO ESTÁTICO PARA CREAR BUILDER
    public static Builder builder() {
        return new Builder();
    }

    // 7. MÉTODOS DE CONVENIENCIA
    public String getDireccionCompleta() {
        StringBuilder sb = new StringBuilder();
        sb.append(calle).append(" ").append(numero);
        
        if (piso != null && piso > 0) {
            sb.append(", Piso ").append(piso);
        }
        
        if (departamento != null && !departamento.isEmpty()) {
            sb.append(", Depto. ").append(departamento);
        }
        
        sb.append(", ").append(localidad)
          .append(", ").append(provincia)
          .append(", ").append(pais)
          .append(" (").append(codPostal).append(")");
        
        return sb.toString();
    }

    // 8. EQUALS Y HASHCODE (importante para JPA)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Direccion)) return false;
        
        Direccion direccion = (Direccion) o;
        
        if (numero != direccion.numero) return false;
        if (!calle.equals(direccion.calle)) return false;
        if (piso != null ? !piso.equals(direccion.piso) : direccion.piso != null) return false;
        if (departamento != null ? !departamento.equals(direccion.departamento) : direccion.departamento != null) return false;
        if (!codPostal.equals(direccion.codPostal)) return false;
        if (!localidad.equals(direccion.localidad)) return false;
        if (!provincia.equals(direccion.provincia)) return false;
        return pais.equals(direccion.pais);
    }

    @Override
    public int hashCode() {
        int result = calle.hashCode();
        result = 31 * result + numero;
        result = 31 * result + (piso != null ? piso.hashCode() : 0);
        result = 31 * result + (departamento != null ? departamento.hashCode() : 0);
        result = 31 * result + codPostal.hashCode();
        result = 31 * result + localidad.hashCode();
        result = 31 * result + provincia.hashCode();
        result = 31 * result + pais.hashCode();
        return result;
    }
}