package com.sliit.uniconnect.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — stateless JWT API
            .csrf(AbstractHttpConfigurer::disable)

            // Apply CORS configuration before any security checks
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless — no HttpSession
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                    // Preflight
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // Public student auth
                    .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                    .requestMatchers(HttpMethod.GET,  "/api/auth/verify-email").permitAll()

                    // Public staff login (no register — staff are provisioned)
                    .requestMatchers(HttpMethod.POST, "/api/staff/auth/login").permitAll()

                    // Public user profile
                    .requestMatchers(HttpMethod.GET, "/api/users/*/profile").permitAll()

                    // Staff management — SYSTEM_ADMIN only
                    .requestMatchers(HttpMethod.POST,   "/api/staff/register").hasRole("SYSTEM_ADMIN")
                    .requestMatchers(HttpMethod.GET,    "/api/staff/faculty-managers").hasRole("SYSTEM_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/staff/**").hasRole("SYSTEM_ADMIN")

                    // Club approval — SYSTEM_ADMIN or FACULTY_MANAGER
                    .requestMatchers(HttpMethod.GET, "/api/clubs/pending")
                            .hasAnyRole("SYSTEM_ADMIN", "FACULTY_MANAGER")
                    .requestMatchers(HttpMethod.PUT, "/api/clubs/*/approve")
                            .hasAnyRole("SYSTEM_ADMIN", "FACULTY_MANAGER")

                    // All other club endpoints — any authenticated user
                    .requestMatchers("/api/clubs/**").authenticated()

                    // Everything else requires a valid JWT
                    .anyRequest().authenticated()
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow any localhost port (covers 5173, 5174, 3000, etc.)
        // Use patterns instead of exact origins so Vite port changes don't break CORS.
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:[*]",
                "http://127.0.0.1:[*]"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

