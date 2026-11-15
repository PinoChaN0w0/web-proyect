package cl.levelup.backend.dto;

import cl.levelup.backend.model.Role;
import jakarta.validation.constraints.*;

public class UserDtos {
    public record UserRequest(
            @NotBlank String nombre,
            @Email @NotBlank String email,
            @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password,
            String fechaNacimiento,
            @NotNull Role role
    ) {}

    public record UserUpdateRequest(
            @NotBlank String nombre,
            @Email @NotBlank String email,
            String password,
            String fechaNacimiento,
            @NotNull Role role
    ) {}

    public record UserResponse(Long id, String nombre, String email, String fechaNacimiento, Role role) {}
}
