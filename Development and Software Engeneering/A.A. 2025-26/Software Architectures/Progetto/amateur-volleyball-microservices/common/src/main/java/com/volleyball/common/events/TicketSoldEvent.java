package com.volleyball.common.events;

import java.io.Serializable;

public record TicketSoldEvent(String ticketId, String matchId, String userId) implements Serializable {
}
