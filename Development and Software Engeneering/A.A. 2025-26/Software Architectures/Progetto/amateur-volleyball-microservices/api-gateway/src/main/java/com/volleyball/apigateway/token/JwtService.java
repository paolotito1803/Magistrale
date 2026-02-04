package com.volleyball.apigateway.token;

import com.volleyball.common.dto.UserDTO;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UserDTO user) {
        return Jwts.builder()
                .setSubject(user.email())
                .claim("role", user.role())
                .claim("userId", user.id())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public void validateToken(String token) {
        Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
    }

    public io.jsonwebtoken.Claims getAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }
}
