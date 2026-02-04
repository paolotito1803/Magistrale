package com.volleyball.tournamentservice.service;

import com.volleyball.common.dto.MatchDTO;
import com.volleyball.common.dto.StadiumDTO;
import com.volleyball.common.dto.TeamDTO;
import com.volleyball.common.dto.TournamentDTO;
import com.volleyball.tournamentservice.integration.TeamsIntegration;
import com.volleyball.tournamentservice.entities.MatchEntity;
import com.volleyball.tournamentservice.entities.TournamentEntity;
import com.volleyball.tournamentservice.repository.MatchRepository;
import com.volleyball.tournamentservice.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final MatchRepository matchRepository;
    private final TeamsIntegration teamsIntegration;

    public TournamentService(TournamentRepository tournamentRepository, MatchRepository matchRepository, TeamsIntegration teamsIntegration) {
        this.tournamentRepository = tournamentRepository;
        this.matchRepository = matchRepository;
        this.teamsIntegration = teamsIntegration;
    }

    public List<TournamentDTO> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<TournamentDTO> getTournamentDetails(String tournamentId) {
        return tournamentRepository.findById(tournamentId).map(this::toDTO);
    }

    public Optional<TournamentDTO> getTournamentByName(String name){
        return tournamentRepository.findByTournamentName(name).map(this::toDTO);
    }

    public void createTournament(String tournamentName, List<String> teamNames) {
        if (teamNames.size() < 2) throw new IllegalArgumentException("Need at least 2 teams.");
        Set<String> unique = new HashSet<>(teamNames);
        if (unique.size() != teamNames.size()) throw new IllegalArgumentException("Duplicate teams.");

        List<TeamDTO> allTeams = teamsIntegration.getAllTeams();
        List<String> validNames = allTeams.stream().map(TeamDTO::name).toList();

        for (String name : teamNames) {
            if (!validNames.contains(name)) {
                throw new IllegalArgumentException("Team " + name + " does not exist.");
            }
        }

        int targetSize = 1;
        while (targetSize < teamNames.size()) targetSize *= 2;
        List<String> bracketTeams = new ArrayList<>(teamNames);
        while (bracketTeams.size() < targetSize) bracketTeams.add("BYE");

        TournamentEntity t = new TournamentEntity(tournamentName, targetSize, bracketTeams);
        tournamentRepository.save(t);

        List<MatchEntity> roundOne = generateBracket(t.getTournamentId(), bracketTeams);

        for (MatchEntity match : roundOne) {
            String autoWinner = findAutoWin(match.getTeamA(), match.getTeamB());
            if (autoWinner != null) {
                processMatchResult(match.getMatchId(), autoWinner);
            }
        }
    }

    private List<MatchEntity> generateBracket(String tournamentId, List<String> teams) {
        List<MatchEntity> firstRound = new ArrayList<>();
        List<MatchEntity> currentRound = new ArrayList<>();
        int stage = 1;
        int matchIndex = 1;

        for (int i = 0; i < teams.size(); i += 2) {
            MatchEntity m = new MatchEntity(tournamentId, "", 0, "", null, stage, matchIndex++, teams.get(i), teams.get(i+1), 0, 0, "", "");
            MatchEntity saved = matchRepository.save(m);
            currentRound.add(saved);
            firstRound.add(saved);
        }

        while (currentRound.size() > 1) {
            List<MatchEntity> nextRound = new ArrayList<>();
            stage++;
            for (int i = 0; i < currentRound.size(); i += 2) {
                MatchEntity parent = new MatchEntity(tournamentId, "", 0, "", null, stage, matchIndex++, "", "", 0, 0, "", "");
                parent = matchRepository.save(parent);

                MatchEntity m1 = currentRound.get(i);
                MatchEntity m2 = currentRound.get(i+1);
                m1.setNextMatchId(parent.getMatchId());
                m2.setNextMatchId(parent.getMatchId());
                matchRepository.save(m1);
                matchRepository.save(m2);

                nextRound.add(parent);
            }
            currentRound = nextRound;
        }
        return firstRound;
    }

    public void updateMatchWinner(String matchId, String winner) {
        if ("BYE".equalsIgnoreCase(winner)) throw new IllegalArgumentException("BYE cannot win.");
        processMatchResult(matchId, winner);
    }

    private void processMatchResult(String matchId, String winner) {
        MatchEntity match = matchRepository.findById(matchId).orElseThrow();

        if (match.getWinner() != null && !match.getWinner().isEmpty()) return;

        match.setWinner(winner);
        matchRepository.save(match);

        if (match.getNextMatchId() != null && !match.getNextMatchId().isEmpty()) {
            MatchEntity next = matchRepository.findById(match.getNextMatchId()).orElseThrow();

            if (next.getTeamA() == null || next.getTeamA().isEmpty()) {
                next.setTeamA(winner);
            } else {
                next.setTeamB(winner);
            }
            matchRepository.save(next);

            String autoWinner = findAutoWin(next.getTeamA(), next.getTeamB());
            if (autoWinner != null) {
                processMatchResult(next.getMatchId(), autoWinner);
            }
        }
    }

    private String findAutoWin(String teamA, String teamB) {
        if (teamA == null || teamB == null || teamA.isEmpty() || teamB.isEmpty()) return null;

        if ("BYE".equalsIgnoreCase(teamA) && "BYE".equalsIgnoreCase(teamB)) return "BYE";
        if (!"BYE".equalsIgnoreCase(teamA) && "BYE".equalsIgnoreCase(teamB)) return teamA;
        if ("BYE".equalsIgnoreCase(teamA) && !"BYE".equalsIgnoreCase(teamB)) return teamB;

        return null;
    }

    public void updateMatchReferee(String matchId, String newReferee) {
        MatchEntity m = matchRepository.findById(matchId).orElseThrow();
        m.setReferee(newReferee);
        matchRepository.save(m);
    }

    public void updateMatchDate(String matchId, LocalDateTime newDate) {
        MatchEntity m = matchRepository.findById(matchId).orElseThrow();
        m.setMatchDate(newDate);
        matchRepository.save(m);
    }

    public void updateMatchScore(String matchId, int scoreA, int scoreB){
        MatchEntity m = matchRepository.findById(matchId).orElseThrow();
        m.setScoreA(scoreA);
        m.setScoreB(scoreB);
        matchRepository.save(m);
    }

    public boolean reserveSeat(String matchId) {
        int rowsUpdated = matchRepository.decrementFreeSeatsIfAvailable(matchId);
        return rowsUpdated > 0;
    }

    public void assignStadiumToMatch(String matchId, String stadiumName) {
        MatchEntity match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        StadiumDTO stadiumDTO = teamsIntegration.getStadiumByName(stadiumName)
                .orElseThrow(() -> new IllegalArgumentException("Stadium not found in Teams Service"));

        match.setStadium(stadiumDTO.name());
        match.setFreeSeats(stadiumDTO.maxSeats());

        matchRepository.save(match);
    }

    public Optional<MatchDTO> findMatchById(String matchId) {
        return matchRepository.findById(matchId).map(this::toMatchDTO);
    }

    public void deleteTournament(String tournamentId) {
        if(!tournamentRepository.existsById(tournamentId))
            throw new IllegalArgumentException("Tournament not found.");
        tournamentRepository.deleteById(tournamentId);
    }

    private MatchDTO toMatchDTO(MatchEntity m) {
        return new MatchDTO(m.getMatchId(), m.getStadium(), m.getFreeSeats(), m.getMatchDate(),
                m.getReferee(), m.getStage(), m.getMatchIndex(), m.getTeamA(), m.getTeamB(),
                m.getScoreA(), m.getScoreB(), m.getWinner(), m.getNextMatchId());
    }

    private TournamentDTO toDTO(TournamentEntity entity) {
        List<MatchDTO> matches = matchRepository.findByTournamentId(entity.getTournamentId()).stream()
                .map(this::toMatchDTO).toList();

        List<TeamDTO> teamDTOList = teamsIntegration.getAllTeams();
        List<TeamDTO> tournamentTeams = new ArrayList<>();
        for(TeamDTO team : teamDTOList) {
            for(MatchDTO match : matches) {
                if(!tournamentTeams.contains(team) && (match.teamA().equals(team.name()) || match.teamB().equals(team.name()))) {
                    tournamentTeams.add(team);
                }
            }
        }
        return new TournamentDTO(entity.getTournamentId(), entity.getTournamentName(), matches, tournamentTeams);
    }

    public List<StadiumDTO> getTournamentStadiums(String tournamentId) {
        TournamentEntity tournament = tournamentRepository.findById(tournamentId).orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        List<TeamDTO> teamDTOList = teamsIntegration.getAllTeams();
        List<String> teams = tournament.getTeams();

        return teamDTOList.stream()
                .filter(team -> teams.contains(team.name()))
                .map(TeamDTO::stadium)
                .toList();
    }

    public int getMatchCount(String tournamentId) {
        return matchRepository.getMatchesByTournamentId(tournamentId).size();
    }

    public int getTeamCount(String tournamentId) {
        return tournamentRepository.findById(tournamentId).orElseThrow(() -> new IllegalStateException("Tournament not found")).getTeams().size();
    }
}