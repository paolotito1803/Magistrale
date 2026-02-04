package com.volleyball.tournamentservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "match")
@Data
@NoArgsConstructor
public class MatchEntity {
    @Id
    private String matchId;

    @Column(name = "tournament_id")
    private String tournamentId;

    @Column(name = "match_index")
    private int matchIndex;

    private String stadium;
    private int freeSeats;
    private LocalDateTime matchDate;
    private String referee;
    private int stage;
    private String teamA;
    private String teamB;
    private int scoreA;
    private int scoreB;
    private String winner;
    private String nextMatchId;

    public MatchEntity(String tournamentId, String stadium, int freeSeats, String referee, LocalDateTime matchDate,
                       int stage, int matchIndex, String teamA, String teamB, int scoreA, int scoreB, String winner, String nextMatchId) {
        this.matchId = UUID.randomUUID().toString();
        this.tournamentId = tournamentId;
        this.stadium = stadium;
        this.freeSeats = freeSeats;
        this.matchDate  = matchDate;
        this.referee = referee;
        this.stage = stage;
        this.matchIndex = matchIndex;
        this.teamA = teamA;
        this.teamB = teamB;
        this.scoreA = scoreA;
        this.scoreB = scoreB;
        this.winner = winner;
        this.nextMatchId = nextMatchId;
    }
}
