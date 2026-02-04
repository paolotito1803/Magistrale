package com.volleyball.ticketingservice.controller;

import com.volleyball.common.dto.TicketDTO;
import com.volleyball.common.security.RequireRole;
import com.volleyball.ticketingservice.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketRestController {

    private final TicketService service;

    public TicketRestController(TicketService service) {
        this.service = service;
    }

    @PostMapping("/booking")
    public ResponseEntity<String> bookTicket(@RequestBody BookTicketRequest request) {
        try {
            service.bookTicket(request.numSeat(), request.matchId(), request.userId());
            return ResponseEntity.ok("Ticket booked successfully");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @GetMapping("/{matchId}/seats")
    public ResponseEntity<String> getAvailableSeats(@PathVariable String matchId) {
        return ResponseEntity.ok("" + service.availableSeats(matchId));
    }

    @DeleteMapping("")
    @RequireRole({"ADMIN"})
    public ResponseEntity<String> deleteAllTickets() {
        service.deleteAllTickets();
        return ResponseEntity.ok("Tickets deleted successfully");
    }

    @GetMapping("/user/{userId}")
    public List<TicketDTO> getUserTickets(@PathVariable String userId) {
        return service.getUserTickets(userId);
    }

    @DeleteMapping("/{matchId}")
    @RequireRole({"ADMIN"})
    public ResponseEntity<String> deleteTicket(@PathVariable String matchId) {
        service.deleteTicketByMatchId(matchId);
        return ResponseEntity.ok("Ticket deleted successfully");
    }

}
