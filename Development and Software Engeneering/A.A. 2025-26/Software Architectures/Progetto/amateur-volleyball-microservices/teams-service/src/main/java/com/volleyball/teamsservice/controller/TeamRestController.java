package com.volleyball.teamsservice.controller;

import com.volleyball.common.dto.PlayerDTO;
import com.volleyball.common.dto.StadiumDTO;
import com.volleyball.common.dto.TeamDTO;
import com.volleyball.common.enums.VolleyballRole;
import com.volleyball.common.security.RequireRole;
import com.volleyball.common.security.AuthContext;
import org.springframework.web.server.ResponseStatusException;
import com.volleyball.teamsservice.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamRestController {

    private final TeamService teamService;

    public TeamRestController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public List<TeamDTO> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable String teamId) {
        return teamService.getTeam(teamId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/players/roles")
    public List<VolleyballRole> getVolleyballRoles(){
        VolleyballRole[] roles = VolleyballRole.values();
        return Arrays.asList(roles);
    }

    @GetMapping("/{coachId}/team")
    public TeamDTO getTeamByCoachId(@PathVariable String coachId) {
        return teamService.getTeamByCoachId(coachId);
    }


    @PostMapping("/register")
    @RequireRole({"COACH"})
    public ResponseEntity<String> registerTeam(@RequestBody TeamRequests.RegisterTeamRequest request) {
        try {
            teamService.registerTeam(request.coachId(), request.coachName(), request.teamName());
            return ResponseEntity.ok("Team registered successfully");
        } catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body("Error data: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error data: " + e.getMessage());
        }
    }

    @PutMapping("/{coachId}/coach")
    @RequireRole({"COACH", "ADMIN"})
    public ResponseEntity<String> changeCoach(@PathVariable String coachId, @RequestBody TeamRequests.ChangeCoachRequest request){
        try {
            teamService.changeCoach(coachId, request.newCoachId(), request.newCoachName());
            return ResponseEntity.ok("Coach changed successfully");
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body("Error data " + e.getMessage());
        } catch(Exception e){
            return ResponseEntity.internalServerError().body("Error data " + e.getMessage());
        }
    }

    @PostMapping("/{coachId}/stadium")
    @RequireRole({"ADMIN", "COACH"})
    public ResponseEntity<String> updateStadium(@PathVariable String coachId, @RequestBody StadiumDTO stadium) {
        if(!AuthContext.isOwnerOrAdmin(coachId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify your own stadium.");
        }
        try {
            teamService.updateStadium(coachId, stadium);
            return ResponseEntity.ok("Stadium updated");
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body("Error data " + e.getMessage());
        } catch(Exception e){
            return ResponseEntity.internalServerError().body("Error data " + e.getMessage());
        }
    }

    @GetMapping("/stadium/{stadiumName}")
    public StadiumDTO getStadium(@PathVariable String stadiumName) {
        return teamService.getStadium(stadiumName);
    }

    @PostMapping("/{coachId}/players")
    @RequireRole({"ADMIN", "COACH"})
    public ResponseEntity<String> addPlayer(@PathVariable String coachId, @RequestBody PlayerDTO player) {
        if(!AuthContext.isOwnerOrAdmin(coachId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches or admin can add new players");
        }

        try {
            teamService.addPlayer(coachId, player);
            return ResponseEntity.ok("Stadium updated");
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body("Error data " + e.getMessage());
        } catch(Exception e){
            return ResponseEntity.internalServerError().body("Error data " + e.getMessage());
        }
    }

    @PutMapping("/{coachId}/players/{currNumber}")
    @RequireRole({"ADMIN", "COACH"})
    public ResponseEntity<String> updatePlayer(@PathVariable String coachId, @PathVariable int currNumber, @RequestBody PlayerDTO updatedPlayer) {
        if(!AuthContext.isOwnerOrAdmin(coachId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches or admin can update players");
        }

        try {
            teamService.updatePlayer(coachId, currNumber, updatedPlayer);
            return ResponseEntity.ok("Player updated");
        } catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body("Error data " + e.getMessage());
        } catch (Exception e){
            return ResponseEntity.internalServerError().body("Error data " + e.getMessage());
        }
    }

    @DeleteMapping("/{coachId}/players/{playerNumber}")
    @RequireRole({"ADMIN", "COACH"})
    public ResponseEntity<String> deletePlayer(@PathVariable String coachId, @PathVariable int playerNumber) {
        if(!AuthContext.isOwnerOrAdmin(coachId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only coaches or admin can delete existing players");
        }

        teamService.removePlayer(coachId, playerNumber);
        return ResponseEntity.ok("Player deleted");
    }

    @DeleteMapping("/{coachId}")
    @RequireRole({"COACH", "ADMIN"})
    public ResponseEntity<String> deleteTeam(@PathVariable String coachId) {
        teamService.deleteTeam(coachId);
        return ResponseEntity.ok("Team deleted");
    }

    @DeleteMapping("/reset")
    @RequireRole({"ADMIN"})
    public void reset() { teamService.deleteAll(); }
}