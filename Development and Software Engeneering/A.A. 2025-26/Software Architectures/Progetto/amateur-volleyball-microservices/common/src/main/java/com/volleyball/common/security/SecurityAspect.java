package com.volleyball.common.security;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Aspect
@Component
public class SecurityAspect {

    // Errors:
    //  Missing header -> 401
    //  Wrong role -> 403
    // By spring AOT this doesn't work if used on private methods, or on self invocations,
    //  so this should be used only on entry points
    @Before("@annotation(requireRole)")
    public void checkRole(RequireRole requireRole) {
        // Get the normalised role from the HTTP Request
        String role = AuthContext.getRole();

        // Normalised set from passed required roles
        Set<String> allowedRoles = Arrays.stream(requireRole.value())
                .map(r -> r.trim().toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());

        // Validation
        if (!allowedRoles.contains(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Insufficient Role");
        }
    }
}