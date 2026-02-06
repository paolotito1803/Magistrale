package com.volleyball.common.dto;

import java.util.List;

public record TournamentDTO(String id, String tournamentName, List<MatchDTO> matches, List<TeamDTO> teams) {
}
