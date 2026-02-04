package com.volleyball.usersservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users") // Matches Gateway Predicate
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Users Service is UP (You shouldn't see this without a token!)";
    }
}