package com.volleyball.usersservice.service;

import com.volleyball.common.dto.InputUserDTO;
import com.volleyball.common.dto.UserDTO;
import com.volleyball.usersservice.entities.UserEntity;
import com.volleyball.usersservice.repository.UserRepository;
import org.apache.catalina.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsersService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UsersService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void createUser(InputUserDTO user) {
        if (userRepository.findByEmail(user.email()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        String encryptedPwd = passwordEncoder.encode(user.password());

        // Use ID provided in DTO if exists otherwise generate
        String id = (user.id() != null && !user.id().isEmpty()) ? user.id() : UUID.randomUUID().toString();

        UserEntity userEntity = new UserEntity(
                id,
                user.username(),
                user.surname(),
                user.email(),
                encryptedPwd,
                user.role(),
                true);
        
        userRepository.save(userEntity);
    }

    public UserDTO validateCredentials(String email, String password) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive())
            throw new IllegalArgumentException("User is not active");

        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new IllegalArgumentException("Wrong password");

        return toDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getReferees() {

        List<UserDTO> ref = userRepository.findAll().stream()
                .filter(u -> Objects.equals(u.getRole(), "REFEREE"))
                .map(this::toDTO)
                .collect(Collectors.toList());
        System.out.println(ref);
        return ref;
    }

    public List<UserDTO> exportUsersByRole(String role) {
        return userRepository.findByRole(role).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void updateUser(String id, InputUserDTO user) {
        UserEntity u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        applyPartialEdits(user,u);
        userRepository.save(u);
    }

    public void deactivateUser(String id) {
        userRepository.findById(id).ifPresent(u -> {
            u.setActive(false);
            userRepository.save(u);
        });
    }

    private UserDTO toDTO(UserEntity entity) {
        return new UserDTO(entity.getId(), entity.getUsername(), entity.getSurname(), entity.getEmail(), entity.getRole());
    }

    private void applyPartialEdits(InputUserDTO dto, UserEntity entity) {
        Optional.ofNullable(dto.username()).ifPresent(entity::setUsername);
        Optional.ofNullable(dto.surname()).ifPresent(entity::setSurname);
        Optional.ofNullable(dto.email()).ifPresent(entity::setEmail);
        Optional.ofNullable(dto.role()).ifPresent(entity::setRole);

        Optional.ofNullable(dto.password()).map(passwordEncoder::encode).ifPresent(entity::setPassword);
    }
}
