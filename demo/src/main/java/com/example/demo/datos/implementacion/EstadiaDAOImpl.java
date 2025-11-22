/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo.datos.implementacion;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.example.demo.datos.dao.*;
import com.example.demo.datos.dto.*;
import com.example.demo.dominio.*;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class EstadiaDAOImpl implements EstadiaDAO {
    private final String RUTA_ARCHIVO = "datos/estadias.json";
    private final Gson gson;
    
    private final HuespedDAOImpl huespedMapper = new HuespedDAOImpl(); // Para reutilizar el mapeo de Huesped

    public EstadiaDAOImpl() {
        this.gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateAdapter()) // Reutiliza el adaptador de HuespedDAOImpl
                .create();
    }
    
    private List<EstadiaDTO> leerArchivo() {
        try (Reader reader = new FileReader(RUTA_ARCHIVO, StandardCharsets.UTF_8)) {
            Type tipoLista = new TypeToken<ArrayList<EstadiaDTO>>() {}.getType();
            List<EstadiaDTO> dtos = gson.fromJson(reader, tipoLista);
            return dtos == null ? new ArrayList<>() : dtos;
        } catch (IOException e) {
            System.out.println("No se pudo leer el archivo de estadías. Se asumirá que está vacío.");
            return new ArrayList<>();
        }
    }

    @Override 
    public List<Estadia> buscarPorHuesped(String tipoDoc, String numDoc) {
        return leerArchivo().stream()
                .filter(estadiaDto -> estadiaDto.huespedes.stream()
                        .anyMatch(huespedDto ->
                                huespedDto.tipoDocumento.toString().equalsIgnoreCase(tipoDoc) &&
                                huespedDto.numeroDocumento.equals(numDoc)
                        )
                )
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private Estadia toDomain(EstadiaDTO dto) {
        Estadia.Builder builder = new Estadia.Builder()
                .setID(dto.id)
                .setCheckIn(LocalDate.parse(dto.check_in))
                .setCheckOut(LocalDate.parse(dto.check_out));

        if (dto.huespedes != null) {
            for (HuespedDTO huespedDTO : dto.huespedes) {
                builder.addHuesped(huespedMapper.toDomain(huespedDTO));
            }
        }
        return builder.build();
    }
}
