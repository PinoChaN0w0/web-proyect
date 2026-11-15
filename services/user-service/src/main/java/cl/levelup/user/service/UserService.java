package cl.levelup.user.service;
import cl.levelup.user.dto.UserDtos.*; import cl.levelup.user.model.User; import cl.levelup.user.repository.UserRepository; import org.springframework.http.HttpStatus; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service; import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate; import java.util.List;
@Service
public class UserService {
    private final UserRepository repository; private final PasswordEncoder passwordEncoder;
    public UserService(UserRepository repository, PasswordEncoder passwordEncoder){this.repository=repository; this.passwordEncoder=passwordEncoder;}
    public List<UserResponse> findAll(){ return repository.findAll().stream().map(this::toResponse).toList(); }
    public UserResponse findById(Long id){ return toResponse(getEntity(id)); }
    public UserResponse create(UserRequest req){
        String email=req.email().trim().toLowerCase(); if(repository.existsByEmail(email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Este correo ya está registrado");
        User u=new User(); u.setNombre(req.nombre().trim()); u.setEmail(email); u.setPassword(passwordEncoder.encode(req.password()));
        u.setFechaNacimiento(req.fechaNacimiento()==null||req.fechaNacimiento().isBlank()?null:LocalDate.parse(req.fechaNacimiento())); u.setRole(req.role()); return toResponse(repository.save(u));
    }
    public UserResponse update(Long id, UserUpdateRequest req){
        User u=getEntity(id); String email=req.email().trim().toLowerCase();
        repository.findByEmail(email).ifPresent(o->{ if(!o.getId().equals(id)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Este correo ya está registrado"); });
        u.setNombre(req.nombre().trim()); u.setEmail(email);
        if(req.password()!=null && !req.password().isBlank()){ if(req.password().length()<6) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La contraseña debe tener al menos 6 caracteres"); u.setPassword(passwordEncoder.encode(req.password())); }
        u.setFechaNacimiento(req.fechaNacimiento()==null||req.fechaNacimiento().isBlank()?null:LocalDate.parse(req.fechaNacimiento())); u.setRole(req.role()); return toResponse(repository.save(u));
    }
    public void delete(Long id){ repository.delete(getEntity(id)); }
    private User getEntity(Long id){ return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuario no encontrado")); }
    private UserResponse toResponse(User u){ return new UserResponse(u.getId(), u.getNombre(), u.getEmail(), u.getFechaNacimiento()==null?null:u.getFechaNacimiento().toString(), u.getRole()); }
}
