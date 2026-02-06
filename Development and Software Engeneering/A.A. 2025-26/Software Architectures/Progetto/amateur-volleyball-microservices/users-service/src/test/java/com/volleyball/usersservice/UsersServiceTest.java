package com.volleyball.usersservice;

import com.volleyball.common.dto.InputUserDTO;
import com.volleyball.common.dto.UserDTO;
import com.volleyball.usersservice.entities.UserEntity;
import com.volleyball.usersservice.repository.UserRepository;
import com.volleyball.usersservice.service.UsersService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsersServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    UsersService usersService;

    @Test
    void shouldCreateUserSuccessfully() {
        InputUserDTO input = new InputUserDTO(null, "John", "Doe", "pass123", "john@mail.com", "COACH");

        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPass");

        usersService.createUser(input);

        // Verify that the repository save was called with the encoded password
        verify(userRepository).save(argThat(user ->
                user.getEmail().equals("john@mail.com") &&
                        user.getPassword().equals("encodedPass")
        ));
    }

    @Test
    void shouldValidateCredentialsSuccessfully() {
        String email = "john@mail.com";
        String rawPass = "pass123";
        String encodedPass = "encodedPass";

        UserEntity mockUser = new UserEntity(UUID.randomUUID().toString(), "John", "Doe", email, encodedPass, "COACH", true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPass, encodedPass)).thenReturn(true);

        UserDTO result = usersService.validateCredentials(email, rawPass);

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(email);
        assertThat(result.role()).isEqualTo("COACH");
    }

    @Test
    void shouldFailValidationWithWrongInput() {
        String email = "hacker@test.com";
        UserEntity mockUser = new UserEntity("1", "Hack", "Er", email, "encoded", "PLAYER", true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(any(), eq("encoded"))).thenReturn(false);

        assertThatThrownBy(() -> usersService.validateCredentials(email, "WRONG_PWD"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Wrong password");
    }

    @Test
    void shouldFailValidationIfUserInactive() {
        String email = "inactive@test.com";
        // User is inactive (false)
        UserEntity mockUser = new UserEntity("1", "Ghost", "User", email, "encoded", "PLAYER", false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        assertThatThrownBy(() -> usersService.validateCredentials(email, "anyPass"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not active");
    }
}