package com.volleyball.common.dto;

public record TicketDTO(String id, int numSeat, MatchDTO match, String userId) {
}
