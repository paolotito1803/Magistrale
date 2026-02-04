package com.volleyball.ticketingservice;

import com.volleyball.common.events.TicketSoldEvent;
import com.volleyball.ticketingservice.entities.TicketEntity;
import com.volleyball.ticketingservice.integration.TournamentIntegration;
import com.volleyball.ticketingservice.repository.TicketRepository;
import com.volleyball.ticketingservice.service.TicketService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock TicketRepository ticketRepository;
    @Mock TournamentIntegration tournamentIntegration;
    @Mock RabbitTemplate rabbitTemplate;

    @InjectMocks
    TicketService ticketService;

    @Test
    void shouldBookTicketSuccessfully() {
        String userId = "user_1";
        String matchId = "match_A";
        int seatNum = 10;

        // Seat not occupied locally
        when(ticketRepository.existsByMatchIdAndNumSeat(matchId, seatNum)).thenReturn(false);

        // Seat reserved successfully in tournament service
        when(tournamentIntegration.reserveSeat(matchId)).thenReturn(true);

        ticketService.bookTicket(seatNum, matchId, userId);

        // Verify save
        verify(ticketRepository).save(any(TicketEntity.class));

        // Verify event published to rabbitmq
        verify(rabbitTemplate).convertAndSend(eq("ticket.sold.queue"), any(TicketSoldEvent.class));
    }

    @Test
    void shouldFailIfTournamentServiceRejects() {
        String matchId = "match_Full";
        int seatNum = 1;

        when(ticketRepository.existsByMatchIdAndNumSeat(matchId, seatNum)).thenReturn(false);
        // Tournament service returns false
        when(tournamentIntegration.reserveSeat(matchId)).thenReturn(false);

        assertThatThrownBy(() -> ticketService.bookTicket(seatNum, matchId, "user_1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No seats available");

        // Checks nothing saved locally or sent to queue
        verify(ticketRepository, never()).save(any());
        verify(rabbitTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }
}