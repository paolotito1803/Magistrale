package com.volleyball.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record MatchDTO(String matchId, String stadium, int freeSeats,
                       @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime matchDate,
                       String referee, int stage, int matchIndex, String teamA, String teamB, int scoreA, int scoreB,
                       String winner, String nextMatch) {
}
