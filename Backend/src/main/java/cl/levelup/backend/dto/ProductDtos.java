package cl.levelup.backend.dto;

import jakarta.validation.constraints.*;

public class ProductDtos {
    public record ProductRequest(
            @NotBlank(message = "El nombre es obligatorio") String nombre,
            @NotBlank(message = "La categoría es obligatoria") String categoria,
            @NotNull(message = "El precio es obligatorio") @Min(value = 1, message = "El precio debe ser mayor a 0") Integer precio,
            String emoji,
            String imagen,
            String descripcion
    ) {}

    public record ProductResponse(Long id, String nombre, String categoria, Integer precio, String emoji, String imagen, String descripcion) {}
}
