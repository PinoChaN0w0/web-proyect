package cl.levelup.user.config;
import cl.levelup.user.security.JwtAuthFilter; import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.*; import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.config.http.SessionCreationPolicy; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.security.web.SecurityFilterChain; import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; import org.springframework.web.cors.*; import java.util.*;
@Configuration
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter; @Value("${app.cors.allowed-origins}") private String allowedOrigins;
    public SecurityConfig(JwtAuthFilter jwtAuthFilter){this.jwtAuthFilter=jwtAuthFilter;}
    @Bean public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf->csrf.disable()).cors(cors->cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm->sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth->auth.requestMatchers("/api/users/**").hasRole("ADMIN").anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); return http.build();
    }
    @Bean public CorsConfigurationSource corsConfigurationSource(){ CorsConfiguration c=new CorsConfiguration(); c.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList()); c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS")); c.setAllowedHeaders(List.of("*")); c.setAllowCredentials(true); UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**",c); return s; }
    @Bean public PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }
}
