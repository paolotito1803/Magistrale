package com.volleyball.common.dto;

public record LoginDTO(String token,
                       UserDTO user) {}
