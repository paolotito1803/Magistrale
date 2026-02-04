package com.volleyball.tournamentservice.integration;

import com.volleyball.common.dto.StadiumDTO;
import com.volleyball.common.dto.TeamDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class TeamsIntegration {

    private final RestClient restClient;

    // Injected url depends on intellij or docker env
    public TeamsIntegration(RestClient.Builder builder, 
                            @Value("${app.services.teams-url}") String teamsUrl) {
        this.restClient = builder.baseUrl(teamsUrl).build();
    }

    public List<TeamDTO> getAllTeams() {
        return restClient.get()
                .uri("/api/teams")
                .retrieve()
                .body(new ParameterizedTypeReference<List<TeamDTO>>(){});
    }

    public Optional<TeamDTO> getTeamById(String teamId) {
        try {
            TeamDTO team = restClient.get()
                    .uri("/api/teams/{id}", teamId)
                    .retrieve()
                    .body(TeamDTO.class);
            return Optional.ofNullable(team);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<StadiumDTO> getStadiumByName(String stadiumName) {
        try {
            StadiumDTO stadium = restClient.get()
                    .uri("/api/teams/stadium/{stadiumName}", stadiumName)
                    .retrieve()
                    .body(StadiumDTO.class);
            return Optional.ofNullable(stadium);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
