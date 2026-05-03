package com.sliit.uniconnect.security;

import com.sliit.uniconnect.repository.StaffUserRepository;
import com.sliit.uniconnect.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final StaffUserRepository staffUserRepository;

    public JwtAuthFilter(JwtUtil jwtUtil,
                         UserRepository userRepository,
                         StaffUserRepository staffUserRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.staffUserRepository = staffUserRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String userId   = jwtUtil.extractUserId(token);
            String role     = jwtUtil.extractRole(token);
            String userType = jwtUtil.extractUserType(token);

            boolean exists = "STAFF".equals(userType)
                    ? staffUserRepository.existsById(userId)
                    : userRepository.existsById(userId);

            if (exists) {
                // Always grant the specific role (e.g. ROLE_CLUB_ADMIN, ROLE_DEPT_LEADER).
                // Also grant ROLE_STUDENT to every student-type user so that
                // @PreAuthorize("hasRole('STUDENT')") works for all student sub-roles.
                List<SimpleGrantedAuthority> authorities;
                if (role != null) {
                    if ("STUDENT".equals(userType) && !"STUDENT".equals(role)) {
                        // Sub-role student: grant both ROLE_<sub-role> and ROLE_STUDENT
                        authorities = List.of(
                                new SimpleGrantedAuthority("ROLE_" + role),
                                new SimpleGrantedAuthority("ROLE_STUDENT")
                        );
                    } else {
                        authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                    }
                } else {
                    authorities = List.of();
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
