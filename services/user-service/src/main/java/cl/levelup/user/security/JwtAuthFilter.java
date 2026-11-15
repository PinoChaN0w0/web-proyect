package cl.levelup.user.security;
import jakarta.servlet.*; import jakarta.servlet.http.*; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.security.web.authentication.WebAuthenticationDetailsSource; import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.List;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService; public JwtAuthFilter(JwtService jwtService){this.jwtService=jwtService;}
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String h=request.getHeader("Authorization"); if(h==null||!h.startsWith("Bearer ")){ chain.doFilter(request,response); return; }
        String jwt=h.substring(7);
        try{ if(jwtService.isTokenValid(jwt) && SecurityContextHolder.getContext().getAuthentication()==null){
            String user=jwtService.extractUsername(jwt); String role=jwtService.extractRole(jwt);
            var auths=role==null?List.<SimpleGrantedAuthority>of():List.of(new SimpleGrantedAuthority("ROLE_"+role));
            var at=new UsernamePasswordAuthenticationToken(user,null,auths); at.setDetails(new WebAuthenticationDetailsSource().buildDetails(request)); SecurityContextHolder.getContext().setAuthentication(at);
        }} catch(Exception ignored){}
        chain.doFilter(request,response);
    }
}
