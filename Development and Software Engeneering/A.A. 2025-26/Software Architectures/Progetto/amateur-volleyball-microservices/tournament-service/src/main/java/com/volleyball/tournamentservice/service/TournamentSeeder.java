package com.volleyball.tournamentservice.service;

import com.volleyball.common.dto.MatchDTO;
import com.volleyball.common.dto.TeamDTO;
import com.volleyball.common.dto.TournamentDTO;
import com.volleyball.common.events.SeedingCompleteEvent;
import com.volleyball.tournamentservice.integration.TeamsIntegration;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class TournamentSeeder {

    private final TournamentService tournamentService;
    private final TeamsIntegration teamsIntegration;
    private final RabbitTemplate rabbitTemplate;

    public TournamentSeeder(TournamentService tournamentService, TeamsIntegration teamsIntegration, RabbitTemplate rabbitTemplate) {
        this.tournamentService = tournamentService;
        this.teamsIntegration = teamsIntegration;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "seeding.tournament.queue", durable = "true"),
            exchange = @Exchange(value = "volleyball.internal", type = "topic", ignoreDeclarationExceptions = "true"),
            key = "seeding.teams.done"
    ))
    public void onTeamsSeeded(SeedingCompleteEvent event) {
        seed();
    }

    public void seed() {
        String tourneyName = "Elemental Championship 2025";

        if (tournamentService.getTournamentByName(tourneyName).isPresent()) {
            sendSeedingEvent();
            return;
        }

        System.out.println("--- Seeding Tournament ---");
        List<String> teams = List.of("Fire Dragons", "Ice Walkers", "Earth Golems", "Wind Flyers");

        try {
            tournamentService.createTournament(tourneyName, teams);

            // Configure Match 1
            Optional<TournamentDTO> tournament = tournamentService.getTournamentByName(tourneyName);
            if (tournament.isPresent() && !tournament.get().matches().isEmpty()) {

                MatchDTO firstMatch = tournament.get().matches().stream()
                        .filter(m -> m.matchIndex() == 1)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Match index 1 not found"));

                tournamentService.updateMatchReferee(firstMatch.matchId(), "id_ref_1");
                tournamentService.updateMatchDate(firstMatch.matchId(),
                        LocalDateTime.now().plusDays(1).withHour(18).withMinute(0));

                try {
                    List<TeamDTO> allTeams = teamsIntegration.getAllTeams();
                    Optional<TeamDTO> hostTeam = allTeams.stream()
                            .filter(t -> t.name().equals("Fire Dragons"))
                            .findFirst();

                    if (hostTeam.isPresent()) {
                        if (hostTeam.get().stadium() != null) {
                            tournamentService.assignStadiumToMatch(firstMatch.matchId(), hostTeam.get().stadium().name());
                            System.out.println("Assigned 'Fire Dragons' Stadium (" + hostTeam.get().stadium().name() + ") to Match 1");
                        } else {
                            System.err.println("Fire Dragons team has no stadium to assign.");
                        }
                    } else {
                        System.err.println("Could not find Fire Dragons to assign stadium");
                    }
                } catch (Exception e) {
                    System.err.println("Error assigning stadium: " + e.getMessage());
                }
            }

            System.out.println("--- Tournament Seeded ---");
            sendSeedingEvent();

        } catch (Exception e) {
            System.err.println("Seeding failed: " + e.getMessage());
        }
    }

    private void sendSeedingEvent() {
        SeedingCompleteEvent event = new SeedingCompleteEvent("tournament-service", LocalDateTime.now().toString());
        rabbitTemplate.convertAndSend("volleyball.internal", "seeding.tournament.done", event);
        System.out.println(">> Signal Sent: Tournament Ready");
    }
}