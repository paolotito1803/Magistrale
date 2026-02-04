package com.volleyball.common.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

// Handles the parsing and logic of the header in the requests
public class AuthContext {

    private static HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No request context available"
            );
        }
        return attributes.getRequest();
    }

    public static String getUserId() {
        String userId = getRequest().getHeader("X-Auth-User-Id");
        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User ID missing"
            );
        }
        return userId;
    }

    public static String getRole() {
        String role = getRequest().getHeader("X-Auth-Role");
        if (role == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Role missing"
            );
        }
        return role.trim().toUpperCase(Locale.ROOT);
    }

    public static boolean isAdmin() {
        return "ADMIN".equals(getRole());
    }

    public static boolean isCoach() {
        return "COACH".equals(getRole());
    }

    // Check if the user has ownership of the action by checking a passed id with the token
    // Admin can do everything always
    public static boolean isOwnerOrAdmin(String resourceOwnerId) {
        if (isAdmin()) return true;
        return getUserId().equals(resourceOwnerId);
    }
}