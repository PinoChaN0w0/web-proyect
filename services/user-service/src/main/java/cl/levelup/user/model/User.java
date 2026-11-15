package cl.levelup.user.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String nombre;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String password;
    private LocalDate fechaNacimiento;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role = Role.CLIENTE;
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getNombre(){return nombre;} public void setNombre(String nombre){this.nombre=nombre;}
    public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
    public String getPassword(){return password;} public void setPassword(String password){this.password=password;}
    public LocalDate getFechaNacimiento(){return fechaNacimiento;} public void setFechaNacimiento(LocalDate fechaNacimiento){this.fechaNacimiento=fechaNacimiento;}
    public Role getRole(){return role;} public void setRole(Role role){this.role=role;}
}
