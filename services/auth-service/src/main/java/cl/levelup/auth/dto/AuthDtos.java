package cl.levelup.auth.dto;

import cl.levelup.auth.model.Role;
import jakarta.validation.constraints.*;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank String nombre,
            @NotBlank String fechaNacimiento,
            @Email @NotBlank String email,
            @Size(min = 6) String password,
            @NotBlank String confirmarPassword
    ) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record AuthResponse(String token, String type, Long id, String nombre, String email, Role role, boolean descuentoActivo) {}
}
