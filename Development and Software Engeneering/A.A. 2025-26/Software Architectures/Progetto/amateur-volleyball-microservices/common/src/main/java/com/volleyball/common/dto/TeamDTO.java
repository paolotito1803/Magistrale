package com.volleyball.common.dto;

import java.util.List;

public record TeamDTO(String id, String coachId, String name, String coachName, List<PlayerDTO> players, StadiumDTO stadium) {
}
