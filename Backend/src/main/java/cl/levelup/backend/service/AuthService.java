package cl.levelup.backend.service;

import cl.levelup.backend.dto.AuthDtos.*;
import cl.levelup.backend.model.Role;
import cl.levelup.backend.model.User;
import cl.levelup.backend.repository.UserRepository;
import cl.levelup.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Period;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager, UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public void register(RegisterRequest req) {
        if (!req.password().equals(req.confirmarPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las contraseñas no coinciden");
        }
        LocalDate fecha = LocalDate.parse(req.fechaNacimiento());
        if (Period.between(fecha, LocalDate.now()).getYears() < 18) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes ser mayor de 18 años para registrarte");
        }
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este correo ya está registrado");
        }
        User user = new User();
        user.setNombre(req.nombre().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setFechaNacimiento(fecha);
        user.setRole(Role.CLIENTE);
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        UserDetails details = userDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(details, Map.of("role", user.getRole().name(), "id", user.getId()));
        boolean descuento = esCorreoDuoc(email);
        return new AuthResponse(token, "Bearer", user.getId(), user.getNombre(), user.getEmail(), user.getRole(), descuento);
    }

    private boolean esCorreoDuoc(String email) {
        String e = email == null ? "" : email.toLowerCase();
        return e.endsWith("@duocuc.cl") || e.endsWith("@duoc.cl");
    }
}
