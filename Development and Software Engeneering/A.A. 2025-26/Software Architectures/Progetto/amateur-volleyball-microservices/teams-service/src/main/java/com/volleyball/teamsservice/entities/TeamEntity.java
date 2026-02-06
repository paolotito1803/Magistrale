package com.volleyball.teamsservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
public class TeamEntity {

    @Id
    private String id;

    private String coachId;
    private String coachName;
    private String name;

    @Embedded
    private StadiumEmbeddable stadium;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlayerEntity> players = new ArrayList<>();

    public TeamEntity(String coachId, String coachName, String teamName) {
        this.id = UUID.randomUUID().toString();
        this.coachId = coachId;
        this.coachName = coachName;
        this.name = teamName;
    }

    public void addPlayer(PlayerEntity player) {
        players.add(player);
        player.setTeam(this);
    }
}
