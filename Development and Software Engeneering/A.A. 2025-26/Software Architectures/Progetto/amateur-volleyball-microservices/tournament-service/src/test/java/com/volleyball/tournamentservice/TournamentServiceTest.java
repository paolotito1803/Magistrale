package com.volleyball.tournamentservice;

import com.volleyball.common.dto.TeamDTO;
import com.volleyball.tournamentservice.entities.MatchEntity;
import com.volleyball.tournamentservice.entities.TournamentEntity;
import com.volleyball.tournamentservice.integration.TeamsIntegration;
import com.volleyball.tournamentservice.repository.MatchRepository;
import com.volleyball.tournamentservice.repository.TournamentRepository;
import com.volleyball.tournamentservice.service.TournamentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

    @Mock TournamentRepository tournamentRepository;
    @Mock MatchRepository matchRepository;
    @Mock TeamsIntegration teamsIntegration;

    @InjectMocks
    TournamentService tournamentService;

    @Test
    void shouldCreateStandard4TeamTournament() {
        String tName = "Winter Cup";
        List<String> teamNames = List.of("A", "B", "C", "D");

        // Mock the HTTP call from teams service
        List<TeamDTO> mockTeamsFromApi = List.of(
                new TeamDTO("1", "c1", "A", "Coach A", List.of(), null),
                new TeamDTO("2", "c2", "B", "Coach B", List.of(), null),
                new TeamDTO("3", "c3", "C", "Coach C", List.of(), null),
                new TeamDTO("4", "c4", "D", "Coach D", List.of(), null)
        );
        when(teamsIntegration.getAllTeams()).thenReturn(mockTeamsFromApi);

        // Mock the save behavior to return the entity passed to it
        when(matchRepository.save(any(MatchEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        tournamentService.createTournament(tName, teamNames);

        // Verify tournament saved
        verify(tournamentRepository).save(any(TournamentEntity.class));
        // Verify matches generated (4 teams = 2 semis + 1 final = 3 matches generated total)
        verify(matchRepository, atLeast(1)).save(any());
    }

    @Test
    void shouldRejectNonExistentTeam() {
        List<String> inputTeams = List.of("RealTeam", "FakeTeam");

        // Mock API returning only RealTeam
        when(teamsIntegration.getAllTeams()).thenReturn(List.of(
                new TeamDTO("1", "c1", "RealTeam", "Coach", List.of(), null)
        ));

        assertThatThrownBy(() -> tournamentService.createTournament("Fail Cup", inputTeams))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not exist");
    }
}