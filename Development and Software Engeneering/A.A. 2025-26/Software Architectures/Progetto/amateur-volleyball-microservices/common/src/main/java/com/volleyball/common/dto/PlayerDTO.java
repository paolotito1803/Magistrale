package com.volleyball.common.dto;
import com.volleyball.common.enums.VolleyballRole;

public record PlayerDTO(String name, int number, VolleyballRole role) {
}
