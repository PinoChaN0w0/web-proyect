package cl.levelup.product.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;

@Service
public class JwtService {
    private final SecretKey key;
    public JwtService(@Value("${app.jwt.secret}") String secret) {
        String padded = secret.length() < 32 ? String.format("%-32s", secret).replace(' ', 'x') : secret;
        this.key = Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8));
    }
    public String extractUsername(String token) { return extractClaim(token, Claims::getSubject); }
    public String extractRole(String token) { Object r = extractAllClaims(token).get("role"); return r == null ? null : r.toString(); }
    public <T> T extractClaim(String token, Function<Claims, T> resolver) { return resolver.apply(extractAllClaims(token)); }
    public boolean isTokenValid(String token) {
        try { extractAllClaims(token); return true; } catch (Exception e) { return false; }
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
