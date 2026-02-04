package com.volleyball.tournamentservice.repository;

import com.volleyball.common.dto.MatchDTO;
import com.volleyball.tournamentservice.entities.MatchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<MatchEntity, String> {
    List<MatchEntity> findByTournamentId(String tournamentId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE MatchEntity m SET m.freeSeats = m.freeSeats - 1 WHERE m.matchId = :matchId AND m.freeSeats > 0")
    int decrementFreeSeatsIfAvailable(String matchId);

    List<MatchEntity> getMatchesByTournamentId(String tournamentId);
}
