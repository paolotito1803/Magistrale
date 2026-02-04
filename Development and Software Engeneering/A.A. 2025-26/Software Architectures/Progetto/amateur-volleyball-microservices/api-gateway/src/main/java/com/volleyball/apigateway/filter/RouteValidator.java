package com.volleyball.apigateway.filter;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;


import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {
    public static final List<String> openRoutes = List.of("/api/auth/login", "/api/users/create", "/api/tournaments", "/api/teams");

    // check if the route does not need the token
    public Predicate<ServerHttpRequest> isSecured = request -> openRoutes.stream().noneMatch(
            route -> request.getURI().getPath().contains(route)
    );
}
