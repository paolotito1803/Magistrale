package com.volleyball.ticketingservice.controller;

public record BookTicketRequest(int numSeat, String matchId, String userId) {}
