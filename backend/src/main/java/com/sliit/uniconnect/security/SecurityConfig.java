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
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                    .requestMatchers(HttpMethod.GET,  "/api/auth/verify-email").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/staff/auth/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/users/*/profile").permitAll()

                    // Admin & Staff Management
                    .requestMatchers(HttpMethod.POST,   "/api/staff/register").hasRole("SYSTEM_ADMIN")
                    .requestMatchers(HttpMethod.GET,    "/api/staff/faculty-managers").hasRole("SYSTEM_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/staff/**").hasRole("SYSTEM_ADMIN")
                    .requestMatchers("/api/admin/users/**").hasRole("SYSTEM_ADMIN")
                    .requestMatchers("/api/admin/students/**").hasRole("SYSTEM_ADMIN")

                    // M2 Module: Events & Chat
                    .requestMatchers("/api/events/**", "/api/chat/**").authenticated()

                    // Real-time Handshake
                    .requestMatchers("/ws/**", "/ws-chat/**").permitAll()

                    // Notifications & Feeds
                    .requestMatchers("/api/notifications/**", "/api/notifications").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/feed").authenticated()

                    .requestMatchers("/api/clubs/**").authenticated()
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
        // Be more explicit to avoid matching issues on some environments
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
