package com.volleyball.teamsservice.controller;

public class TeamRequests {
    public record ChangeCoachRequest(String newCoachId, String newCoachName) {}
    public record RegisterTeamRequest(String coachId, String coachName, String teamName) {}
}
