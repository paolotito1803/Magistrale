package com.volleyball.teamsservice.service;

import com.volleyball.common.dto.PlayerDTO;
import com.volleyball.common.dto.StadiumDTO;
import com.volleyball.common.dto.TeamDTO;
import com.volleyball.teamsservice.entities.*;
import com.volleyball.teamsservice.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TeamService {

    private final TeamRepository repo;
    // NOTE: no UsersService to inject here directly, validation later via RestClient or trusting the token

    public TeamService(TeamRepository repo) {
        this.repo = repo;
    }

    public void registerTeam(String coachId, String coachName, String teamName) {
        // TODO: Call Users-Service to verify coachId is actually a Coach?

        if (repo.existsByCoachId(coachId)) {
            throw new IllegalStateException("Coach " + coachName + " already has a registered team.");
        }
        if (repo.existsByName(teamName)) {
            throw new IllegalArgumentException("Team name '" + teamName + "' is already taken.");
        }

        TeamEntity newTeam = new TeamEntity(coachId, coachName, teamName);
        repo.save(newTeam);
    }

    public void changeCoach(String oldCoachId, String newCoachId, String newCoachName) {
        // 1. Validate the new coach exists and is actually a coach
        // TODO: Call Users-Service to verify coachId exists is actually a Coach?

        // 2. Ensure the new coach doesn't already have a team
        if (repo.existsByCoachId(newCoachId)) {
            throw new IllegalStateException("The new coach already leads another team. Cannot transfer ownership.");
        }

        // 3. Get the team belonging to the old coach
        TeamEntity team = getByCoachIdOrThrow(oldCoachId);

        // 4. Update details
        team.setCoachId(newCoachId);
        team.setCoachName(newCoachName);

        // 5. Save
        repo.save(team);
    }

    public void updateStadium(String coachId, StadiumDTO stadium) {
        if (stadium == null || stadium.name() == null || stadium.name().isBlank()) {
            throw new IllegalArgumentException("Stadium name cannot be empty.");
        }
        TeamEntity team = getByCoachIdOrThrow(coachId);
        team.setStadium(new StadiumEmbeddable(stadium.name(), stadium.maxSeats()));
        repo.save(team);
    }

    public void addPlayer(String coachId, PlayerDTO player) {
        TeamEntity team = getByCoachIdOrThrow(coachId);

        boolean numberAlreadyTaken = team.getPlayers().stream()
                .anyMatch(p -> p.getNumber() == player.number());
        if (numberAlreadyTaken) {
            throw new IllegalArgumentException("Player number " + player.number() + " is already taken.");
        }

        PlayerEntity newPlayer = new PlayerEntity(player.name(), player.number(), player.role(), team);
        team.addPlayer(newPlayer);
        repo.save(team);
    }

    public void updatePlayer(String coachId, int currentNumber, PlayerDTO updatedDetails) {
        // 1. Retrieve Team
        TeamEntity team = getByCoachIdOrThrow(coachId);

        // 2. Find the player to update
        PlayerEntity playerToUpdate = team.getPlayers().stream()
                .filter(p -> p.getNumber() == currentNumber)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Player with number " + currentNumber + " not found in this team."));

        // 3. Business Rule: Logic for changing jersey numbers
        if (updatedDetails.number() != currentNumber) {
            // Check if the new number is already taken by someone else
            boolean numberTaken = team.getPlayers().stream()
                    .anyMatch(p -> p.getNumber() == updatedDetails.number());

            if (numberTaken) {
                throw new IllegalArgumentException("Cannot change number to " + updatedDetails.number() + " because it is already taken.");
            }
        }

        // 4. Update Fields
        playerToUpdate.setName(updatedDetails.name());
        playerToUpdate.setRole(updatedDetails.role());
        playerToUpdate.setNumber(updatedDetails.number());

        // 5. Save
        repo.save(team);
    }

    public void removePlayer(String coachId, int playerNumber) {
        // Because 'orphanRemoval = true' is set in TeamEntity, removing it from the list
        // and saving the team triggers a DELETE SQL statement.
        deletePlayer(coachId, playerNumber);
    }

    public List<TeamDTO> getAllTeams() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<TeamDTO> getTeam(String teamId) {
        return repo.findById(teamId).map(this::toDTO);
    }

    public TeamDTO getTeamByCoachId(String coachId){
        TeamEntity team =  getByCoachIdOrThrow(coachId);
        return toDTO(team);
    }

    public StadiumDTO getStadium(String stadiumName){
        Optional<TeamEntity> t = repo.findByStadium_StadiumName(stadiumName);
        return t.map(teamEntity -> new StadiumDTO(teamEntity.getStadium().getStadiumName(), teamEntity.getStadium().getStadiumCapacity())).orElse(null);
    }

    // Helpers
    private TeamEntity getByCoachIdOrThrow(String coachId) {
        return repo.findByCoachId(coachId)
                .orElseThrow(() -> new RuntimeException("Team not found for coach: " + coachId));
    }

    private void deletePlayer(String coachId, int playerNumber) {
        TeamEntity team = getByCoachIdOrThrow(coachId);

        boolean changed = team.getPlayers().removeIf(p -> p.getNumber() == playerNumber);

        if (changed)
            repo.save(team);
    }

    private TeamDTO toDTO(TeamEntity entity) {
        StadiumDTO stadiumDTO = null;
        if (entity.getStadium() != null) {
            stadiumDTO = new StadiumDTO(entity.getStadium().getStadiumName(), entity.getStadium().getStadiumCapacity());
        }

        List<PlayerDTO> playerDTOs = entity.getPlayers().stream()
                .map(p -> new PlayerDTO(p.getName(), p.getNumber(), p.getRole()))
                .toList();

        return new TeamDTO(entity.getId(), entity.getCoachId(), entity.getName(), entity.getCoachName(), playerDTOs, stadiumDTO);
    }

    public void deleteTeam(String coachId){
        repo.deleteTeamEntityByCoachId(coachId);
    }

    public void deleteAll() { repo.deleteAll(); }
}