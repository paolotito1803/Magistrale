package com.volleyball.teamsservice.entities;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StadiumEmbeddable {
    private String stadiumName;
    private int stadiumCapacity;
}