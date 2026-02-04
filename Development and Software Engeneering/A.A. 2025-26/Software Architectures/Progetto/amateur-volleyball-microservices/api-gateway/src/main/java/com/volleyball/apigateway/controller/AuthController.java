package com.volleyball.apigateway.controller;

import com.volleyball.apigateway.token.JwtService;
import com.volleyball.common.dto.LoginDTO;
import com.volleyball.common.dto.LoginRequestDTO;
import com.volleyball.common.dto.UserDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtService  jwtService;
    private final WebClient usersClient;

    public AuthController(JwtService jwtService, WebClient.Builder builder, @Value("${users.service.url}") String userUrl) {
        this.jwtService = jwtService;
        this.usersClient = builder.baseUrl(userUrl).build();
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<LoginDTO>> login(@RequestBody LoginRequestDTO request) {
        return usersClient.post()
                .uri("/api/users/validate")
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response -> Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED)))
                .bodyToMono(UserDTO.class).map(user -> {
                    String token = jwtService.generateToken(user);
                    return ResponseEntity.ok(new LoginDTO(token, user));
                });

    }
}
