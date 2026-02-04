package com.volleyball.tournamentservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tournament")
@Data
@NoArgsConstructor
public class TournamentEntity {
    @Id
    private String tournamentId;
    private String tournamentName;
    private int maxTournamentTeams;

    @ElementCollection
    @CollectionTable(name = "tournament_teams", joinColumns = @JoinColumn(name = "tournament_id"))
    @Column(name = "team_name")
    private List<String> teams;

    public TournamentEntity(String tournamentName, int maxTournamentTeams, List<String> teams) {
        this.tournamentId = UUID.randomUUID().toString();
        this.tournamentName = tournamentName;
        this.teams = teams;
        this.maxTournamentTeams = maxTournamentTeams;
    }
}
