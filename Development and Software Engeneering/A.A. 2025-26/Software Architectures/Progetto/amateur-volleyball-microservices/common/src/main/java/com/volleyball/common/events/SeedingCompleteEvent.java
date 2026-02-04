package com.volleyball.common.events;

import java.io.Serializable;

// Generic event to carry the source of the seeding daisy chain
public record SeedingCompleteEvent(String sourceService, String timestamp) implements Serializable {}
