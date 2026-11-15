package cl.levelup.auth.config;

import cl.levelup.auth.model.Role;
import cl.levelup.auth.model.User;
import cl.levelup.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initAdmin(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByEmail("admin@levelup.cl")) {
                User admin = new User();
                admin.setNombre("Administrador"); admin.setEmail("admin@levelup.cl");
                admin.setPassword(encoder.encode("Admin123!")); admin.setFechaNacimiento(LocalDate.of(1990,1,1)); admin.setRole(Role.ADMIN);
                users.save(admin);
            }
        };
    }
}
