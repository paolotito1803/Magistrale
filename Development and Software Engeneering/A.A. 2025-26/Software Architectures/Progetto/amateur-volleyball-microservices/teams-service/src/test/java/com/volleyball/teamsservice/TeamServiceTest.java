package com.volleyball.teamsservice;

import com.volleyball.common.dto.PlayerDTO;
import com.volleyball.common.enums.VolleyballRole;
import com.volleyball.teamsservice.entities.TeamEntity;
import com.volleyball.teamsservice.repository.TeamRepository;
import com.volleyball.teamsservice.service.TeamService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock TeamRepository teamRepository;
    @InjectMocks
    TeamService teamService;

    @Test
    void shouldRegisterTeamSuccessfully() {
        String coachId = "coach_1";
        String teamName = "Tigers";

        when(teamRepository.existsByCoachId(coachId)).thenReturn(false);
        when(teamRepository.existsByName(teamName)).thenReturn(false);

        teamService.registerTeam(coachId, "Coach Name", teamName);

        verify(teamRepository).save(any(TeamEntity.class));
    }

    @Test
    void shouldRejectDuplicateTeamNames() {
        String teamName = "Duplicate FC";
        when(teamRepository.existsByName(teamName)).thenReturn(true);

        assertThatThrownBy(() -> teamService.registerTeam("coach_2", "Coach", teamName))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    void shouldAddPlayerToTeam() {
        String coachId = "coach_1";
        TeamEntity mockTeam = new TeamEntity(coachId, "Coach", "Tigers");
        mockTeam.setPlayers(new ArrayList<>());

        when(teamRepository.findByCoachId(coachId)).thenReturn(Optional.of(mockTeam));

        teamService.addPlayer(coachId, new PlayerDTO("Spiker", 10, VolleyballRole.PLAYER));

        verify(teamRepository).save(mockTeam);
    }
}