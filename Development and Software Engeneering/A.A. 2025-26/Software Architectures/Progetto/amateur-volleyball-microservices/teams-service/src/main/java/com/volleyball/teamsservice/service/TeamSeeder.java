package com.volleyball.teamsservice.service;

import com.volleyball.common.dto.PlayerDTO;
import com.volleyball.common.dto.StadiumDTO;
import com.volleyball.common.enums.VolleyballRole;
import com.volleyball.common.events.SeedingCompleteEvent;
import com.volleyball.teamsservice.repository.TeamRepository;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TeamSeeder {

    private final TeamService teamService;
    private final TeamRepository teamRepository;
    private final RabbitTemplate rabbitTemplate;

    public TeamSeeder(TeamService teamService, TeamRepository teamRepository, RabbitTemplate rabbitTemplate) {
        this.teamService = teamService;
        this.teamRepository = teamRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "seeding.teams.queue", durable = "true"),
            exchange = @Exchange(value = "volleyball.internal", type = "topic", ignoreDeclarationExceptions = "true"),
            key = "seeding.users.done"
    ))
    public void onUsersSeeded(SeedingCompleteEvent event) {
        seed();
    }

    public void seed() {
        System.out.println("--- Seeding Teams ---");

        createFullTeam("id_coach_1", "Coach Fire", "Fire Dragons", "Volcano Arena", 5000);
        createFullTeam("id_coach_2", "Coach Ice", "Ice Walkers", "Glacier Dome", 3000);
        createFullTeam("id_coach_3", "Coach Earth", "Earth Golems", "Canyon Court", 4500);
        createFullTeam("id_coach_4", "Coach Wind", "Wind Flyers", "Sky Gym", 2000);

        System.out.println("--- Teams Checked/Seeded ---");

        // We are done so tournament can start seeding now
        sendSeedingEvent();
    }

    private void sendSeedingEvent() {
        SeedingCompleteEvent event = new SeedingCompleteEvent("teams-service", LocalDateTime.now().toString());
        rabbitTemplate.convertAndSend("volleyball.internal", "seeding.teams.done", event);
        System.out.println(">> Signal Sent: Teams Ready");
    }

    private void createFullTeam(String coachId, String coachName, String teamName, String stadiumName, int seats) {
        if (teamRepository.findByCoachId(coachId).isPresent()) {
            return;
        }

        System.out.println("Restoring missing team: " + teamName);
        teamService.registerTeam(coachId, coachName, teamName);
        teamService.updateStadium(coachId, new StadiumDTO(stadiumName, seats));

        // Create 6 players
        for (int i = 1; i <= 6; i++) {
            VolleyballRole role = (i == 1) ? VolleyballRole.SETTER : (i == 6 ? VolleyballRole.LIBERO : VolleyballRole.PLAYER);
            teamService.addPlayer(coachId, new PlayerDTO(teamName + " Player " + i, i, role));
        }
    }
}