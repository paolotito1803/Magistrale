package com.volleyball.teamsservice.repository;

import com.volleyball.teamsservice.entities.TeamEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<TeamEntity, String> {
    Optional<TeamEntity> findByCoachId(String coachId);
    Optional<TeamEntity> findByStadium_StadiumName(String stadiumName);
    boolean existsByCoachId(String coachId);
    boolean existsByName(String name);
    void deleteTeamEntityByCoachId(String coachId);
}
