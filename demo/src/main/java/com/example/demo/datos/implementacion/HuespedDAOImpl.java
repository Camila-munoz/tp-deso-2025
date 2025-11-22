/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.datos.implementacion;

import com.example.demo.datos.dao.*;
import com.example.demo.datos.dto.*;
import com.example.demo.dominio.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.TypeAdapter;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import java.io.*;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class HuespedDAOImpl implements HuespedDAO {
    private final String RUTA_ARCHIVO = "datos/huespedes.json";
    private final Gson gson;

    public HuespedDAOImpl() {
        this.gson = new GsonBuilder()
                .setPrettyPrinting()
                .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
                .create();
    }

    private List<HuespedDTO> leerArchivo() {
        try (Reader reader = new FileReader(RUTA_ARCHIVO, StandardCharsets.UTF_8)) {
            Type tipoLista = new TypeToken<ArrayList<HuespedDTO>>() {}.getType();
            List<HuespedDTO> dtos = gson.fromJson(reader, tipoLista);
            return dtos == null ? new ArrayList<>() : dtos;
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    private void escribirArchivo(List<HuespedDTO> huespedes) {
        try (Writer writer = new FileWriter(RUTA_ARCHIVO, StandardCharsets.UTF_8)) {
            gson.toJson(huespedes, writer);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void guardar(Huesped huesped) {
        List<HuespedDTO> huespedes = leerArchivo();
        huespedes.add(toDTO(huesped));
        escribirArchivo(huespedes);
    }

    @Override
    public void actualizar(Huesped huesped) {
        List<HuespedDTO> huespedes = leerArchivo();
        huespedes.removeIf(h -> h.tipoDocumento == huesped.getTipoDocumento() && h.numeroDocumento.equals(huesped.getNumeroDocumento()));
        huespedes.add(toDTO(huesped));
        escribirArchivo(huespedes);
    }

    @Override
    public void eliminar(String tipoDoc, String numDoc) {
        List<HuespedDTO> huespedes = leerArchivo();
        huespedes.removeIf(h -> h.tipoDocumento.toString().equals(tipoDoc) && h.numeroDocumento.equals(numDoc));
        escribirArchivo(huespedes);
    }

    @Override
    public Optional<Huesped> buscarPorDocumento(String tipoDoc, String numDoc) {
        return leerArchivo().stream()
                .filter(h -> h.tipoDocumento.toString().equals(tipoDoc) && h.numeroDocumento.equals(numDoc))
                .map(this::toDomain)
                .findFirst();
    }

    @Override
    public List<Huesped> buscarTodos() {
        return leerArchivo().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Huesped> buscarPor(Predicate<Huesped> filtro) {
        return this.buscarTodos().stream()
                .filter(filtro)
                .collect(Collectors.toList());
    }

    //métodos de mapeo
    private HuespedDTO toDTO(Huesped h) {
        HuespedDTO dto = new HuespedDTO();
        dto.nombre = h.getNombre();
        dto.apellido = h.getApellido();
        dto.tipoDocumento = h.getTipoDocumento();
        dto.numeroDocumento = h.getNumeroDocumento();
        dto.cuit = h.getCuit();
        dto.posicionIVA = h.getPosicionIVA();
        dto.fechaNacimiento = h.getFechaNacimiento() != null ? h.getFechaNacimiento().toString() : null;
        dto.edad = h.getEdad();
        dto.telefono = h.getTelefono();
        dto.email = h.getEmail();
        dto.ocupacion = h.getOcupacion();
        dto.nacionalidad = h.getNacionalidad();

        DireccionDTO dirDto = new DireccionDTO();
        if (h.getDireccion() != null) {
            dirDto.calle = h.getDireccion().getCalle();
            dirDto.numero = h.getDireccion().getNumero();
            dirDto.piso = h.getDireccion().getPiso();
            dirDto.departamento = h.getDireccion().getDepartamento();
            dirDto.codigoPostal = h.getDireccion().getCodPostal();
            dirDto.localidad = h.getDireccion().getLocalidad();
            dirDto.provincia = h.getDireccion().getProvincia();
            dirDto.pais = h.getDireccion().getPais();
        }
        dto.direccion = dirDto;
        return dto;
    }

    public Huesped toDomain(HuespedDTO dto) {
        Direccion dir = new Direccion.Builder()
                .calle(dto.direccion.calle)
                .numero(dto.direccion.numero)
                .piso(dto.direccion.piso)
                .departamento(dto.direccion.departamento)
                .codPostal(dto.direccion.codigoPostal)
                .localidad(dto.direccion.localidad)
                .provincia(dto.direccion.provincia)
                .pais(dto.direccion.pais)
                .build();

        return new Huesped.Builder(dto.tipoDocumento, dto.numeroDocumento)
                .setNombre(dto.nombre)
                .setApellido(dto.apellido)
                .setCuit(dto.cuit)
                .setPosicionIVA(dto.posicionIVA)
                .setFechaNacimiento(dto.fechaNacimiento != null ? LocalDate.parse(dto.fechaNacimiento) : null)
                .setEdad(dto.edad)
                .setTelefono(dto.telefono)
                .setEmail(dto.email)
                .setOcupacion(dto.ocupacion)
                .setNacionalidad(dto.nacionalidad)
                .setDireccion(dir)
                .build();
    }
}

//adaptador para que Gson pueda manejar LocalDate
class LocalDateAdapter extends TypeAdapter<LocalDate> {
    @Override
    public void write(JsonWriter out, LocalDate value) throws IOException {
        out.value(value.toString());
    }

    @Override
    public LocalDate read(JsonReader in) throws IOException {
        return LocalDate.parse(in.nextString());
    }
}