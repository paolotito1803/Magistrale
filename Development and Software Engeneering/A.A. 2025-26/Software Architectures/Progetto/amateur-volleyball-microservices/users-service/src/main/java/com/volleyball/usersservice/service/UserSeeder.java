package com.volleyball.usersservice.service;

import com.volleyball.common.dto.InputUserDTO;
import com.volleyball.common.events.SeedingCompleteEvent;
import com.volleyball.usersservice.repository.UserRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UsersService usersService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;
    @Value("${app.admin.username}") private String adminUsername;
    @Value("${app.admin.surname}") private String adminSurname;
    @Value("${app.admin.role}") private String adminRole;
    @Value("${app.dev.default-password}") private String defaultPassword;

    public UserSeeder(UserRepository userRepository, UsersService usersService, RabbitTemplate rabbitTemplate) {
        this.userRepository = userRepository;
        this.usersService = usersService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void run(String... args) {
        System.out.println("--- Seeding Users ---");

        // Admin
        create("id_admin_1", adminUsername, adminSurname, adminEmail, adminRole, adminPassword);

        // Coaches
        create("id_coach_1", "coach_fire", "Fire", "coach1@mail.com", "COACH");
        create("id_coach_2", "coach_ice", "Ice", "coach2@mail.com", "COACH");
        create("id_coach_3", "coach_earth", "Earth", "coach3@mail.com", "COACH");
        create("id_coach_4", "coach_wind", "Wind", "coach4@mail.com", "COACH");

        // Referees
        create("id_ref_1", "ref_john", "Doe", "ref1@mail.com", "REFEREE");
        create("id_ref_2", "ref_jane", "Smith", "ref2@mail.com", "REFEREE");

        // Players/Viewers
        create("id_player_1", "mario_spikes", "Rossi", "player1@mail.com", "PLAYER");
        create("id_viewer_1", "luigi_watch", "Verdi", "viewer1@mail.com", "VIEWER");

        System.out.println("--- Users Checked/Seeded ---");

        // We need to tell TeamsService the users are ready
        sendSeedingEvent();
    }

    private void sendSeedingEvent() {
        SeedingCompleteEvent event = new SeedingCompleteEvent("users-service", LocalDateTime.now().toString());
        rabbitTemplate.convertAndSend("volleyball.internal", "seeding.users.done", event);
        System.out.println(">> Signal Sent: Users Ready");
    }

    private void create(String id, String username, String surname, String email, String role) {
        create(id, username, surname, email, role, defaultPassword);
    }

    private void create(String id, String username, String surname, String email, String role, String password) {
        if (userRepository.findByEmail(email).isEmpty()) {
            System.out.println("Restoring missing user: " + username);
            usersService.createUser(new InputUserDTO(id, username, surname, password, email, role));
        }
    }
}