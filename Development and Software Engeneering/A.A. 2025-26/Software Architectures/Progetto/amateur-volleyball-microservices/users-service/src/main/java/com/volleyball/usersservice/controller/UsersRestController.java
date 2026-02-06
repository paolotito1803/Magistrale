package com.volleyball.usersservice.controller;

import com.volleyball.common.dto.InputUserDTO;
import com.volleyball.common.dto.LoginDTO;
import com.volleyball.common.dto.LoginRequestDTO;
import com.volleyball.common.dto.UserDTO;
import com.volleyball.common.security.RequireRole;
import com.volleyball.usersservice.service.UsersService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsersRestController {

    private final UsersService usersService;

    @Value("${app.dev.default-password}")
    private String defaultPassword;

    public UsersRestController(UsersService usersService) {
        this.usersService = usersService;
    }

    @PostMapping("/validate")
    public ResponseEntity<UserDTO> validateUser(@RequestBody LoginRequestDTO request) {
        try {
            UserDTO u = usersService.validateCredentials(request.email(), request.password());
            return ResponseEntity.ok(u);
        }catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return usersService.getAllUsers();
    }

    @GetMapping("/referees")
    public ResponseEntity<List<UserDTO>> getRefereesUsers() {
        try {
            List<UserDTO> users = usersService.getReferees();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // TODO: check auth for this
    @PostMapping("/create")
    public ResponseEntity<String> createUser(@RequestBody InputUserDTO user) {
        try {
            usersService.createUser(user);
            return ResponseEntity.ok("User created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    // TODO: check auth for this
    @PutMapping("/update/{userId}")
    public ResponseEntity<String> updateUser(@PathVariable String userId, @RequestBody InputUserDTO user) {
        try{
            usersService.updateUser(userId, user);
            return ResponseEntity.ok("User updated successfully");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/export/{role}")
    public List<UserDTO> exportByRole(@PathVariable String role) {
        return usersService.exportUsersByRole(role);
    }
    
    @DeleteMapping("/reset")
    @RequireRole({"ADMIN"})
    public ResponseEntity<String> reset() {
        // It deactivates, not delete
        usersService.getAllUsers().forEach(u -> usersService.deactivateUser(u.id()));
        return ResponseEntity.ok("All users deactivated");
    }
}