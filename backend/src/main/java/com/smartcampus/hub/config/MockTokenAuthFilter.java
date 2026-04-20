package com.smartcampus.hub.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * MockTokenAuthFilter
 *
 * For demo/assignment purposes: reads the X-User-Email and Authorization headers
 * sent by the frontend and sets a Spring SecurityContext authentication so that
 * endpoints marked as .authenticated() accept the request.
 *
 * This avoids the need for a real JWT library while keeping the security
 * configuration enforced (only callers that went through /api/auth/login
 * will have the correct headers set by apiClient.js).
 */
public class MockTokenAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String userEmail  = request.getHeader("X-User-Email");
        String userRole   = request.getHeader("X-User-Role");

        // Only process if a Bearer token is present and no auth is already set
        if (authHeader != null && authHeader.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null
                && userEmail != null && !userEmail.isBlank()) {

            String role = (userRole != null && !userRole.isBlank()) ? userRole : "USER";

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
