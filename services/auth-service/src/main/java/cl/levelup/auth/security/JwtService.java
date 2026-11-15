package cl.levelup.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    private final SecretKey key; private final long expirationMs;
    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs) {
        String padded = secret.length() < 32 ? String.format("%-32s", secret).replace(' ', 'x') : secret;
        this.key = Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8)); this.expirationMs = expirationMs;
    }
    public String extractUsername(String token) { return extractClaim(token, Claims::getSubject); }
    public <T> T extractClaim(String token, Function<Claims, T> resolver) { return resolver.apply(extractAllClaims(token)); }
    public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        return Jwts.builder().claims(extraClaims).subject(userDetails.getUsername()).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs)).signWith(key).compact();
    }
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try { return extractUsername(token).equals(userDetails.getUsername()) && !extractClaim(token, Claims::getExpiration).before(new Date()); }
        catch (Exception e) { return false; }
    }
    private Claims extractAllClaims(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
