package com.volleyball.tournamentservice.controller;
import java.util.List;
public class TournamentRequests {
    public record CreateTournamentRequest(String tournamentName, List<String> teams) {}
    public record UpdateWinnerRequest(String matchId, String winner) {}
    public record AssignStadiumRequest(String matchId, String newStadium) {}
    public record UpdateRefereeRequest(String matchId, String newReferee) {}
    public record UpdateMatchDateRequest(String matchId, String date) {}
    public record UpdateMatchScoresRequest(String matchId, int scoreA, int scoreB) {}
}
