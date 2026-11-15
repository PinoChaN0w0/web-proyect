package cl.levelup.user.dto;
import cl.levelup.user.model.Role;
import jakarta.validation.constraints.*;
public class UserDtos {
    public record UserRequest(@NotBlank String nombre, @Email @NotBlank String email, @Size(min=6) String password, String fechaNacimiento, @NotNull Role role) {}
    public record UserUpdateRequest(@NotBlank String nombre, @Email @NotBlank String email, String password, String fechaNacimiento, @NotNull Role role) {}
    public record UserResponse(Long id, String nombre, String email, String fechaNacimiento, Role role) {}
}
