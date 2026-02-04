package com.volleyball.apigateway.filter;

import com.volleyball.apigateway.token.JwtService;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {
    private final JwtService jwtService;
    private final RouteValidator routeValidator;

    public static class Config{}
    public AuthFilter(JwtService jwtService, RouteValidator routeValidator) {
        super(AuthFilter.Config.class);
        this.jwtService = jwtService;
        this.routeValidator = routeValidator;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            // 1. Check if the route is secured
            if (!routeValidator.isSecured.test(exchange.getRequest())) {
                return chain.filter(exchange);
            }

            // 2. Check for Header
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Authorization Header");
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }

            try {
                // 3. Validate Token
                jwtService.validateToken(authHeader);

                // 4. Extract info and pass it to Microservices via Headers
                io.jsonwebtoken.Claims claims = jwtService.getAllClaims(authHeader);

                var mutatedExchange = exchange.mutate().request(
                        exchange.getRequest().mutate()
                        .header("X-Auth-User-Id", claims.get("userId", String.class))
                        .header("X-Auth-Role", claims.get("role", String.class))
                        .build()
                    ).build();
                return chain.filter(mutatedExchange);

            } catch (Exception e) {
                System.out.println("Invalid Token Access: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Token");
            }
        });
    }
}
