package com.volleyball.teamsservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.volleyball.common.enums.VolleyballRole;

@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
public class PlayerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int number;

    @Enumerated(EnumType.STRING)
    private VolleyballRole role;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private TeamEntity team;

    public PlayerEntity(String name, int number, VolleyballRole role, TeamEntity team) {
        this.name = name;
        this.number = number;
        this.role = role;
        this.team = team;
    }
}
