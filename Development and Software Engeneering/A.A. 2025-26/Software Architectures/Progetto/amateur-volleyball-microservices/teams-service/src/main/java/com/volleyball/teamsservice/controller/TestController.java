package com.volleyball.teamsservice.controller;

import com.volleyball.common.dto.StadiumDTO;
import com.volleyball.common.dto.TeamDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Teams Service is UP and Running!";
    }

    @GetMapping("/testDTO")
    public TeamDTO test_DTO() {
        StadiumDTO stadium = new StadiumDTO("Test Arena", 5000);
        return new TeamDTO("1", "coach_1", "Test Team", "Coach Mike", List.of(), stadium);
    }
}