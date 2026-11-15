package cl.levelup.backend.dto;

import cl.levelup.backend.model.Role;
import jakarta.validation.constraints.*;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank(message = "El nombre es obligatorio") String nombre,
            @NotBlank(message = "La fecha de nacimiento es obligatoria") String fechaNacimiento,
            @Email(message = "Correo inválido") @NotBlank(message = "El correo es obligatorio") String email,
            @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password,
            @NotBlank(message = "Debe confirmar la contraseña") String confirmarPassword
    ) {}

    public record LoginRequest(
            @Email(message = "Correo inválido") @NotBlank String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(String token, String type, Long id, String nombre, String email, Role role, boolean descuentoActivo) {}
}
