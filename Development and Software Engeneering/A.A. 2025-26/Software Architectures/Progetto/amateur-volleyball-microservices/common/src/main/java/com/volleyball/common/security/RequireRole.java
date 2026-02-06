package com.volleyball.common.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD) // Applied to methods
@Retention(RetentionPolicy.RUNTIME) // Used at runtime
public @interface RequireRole {
    String[] value(); // takes array of roles, like: @RequireRole({"ADMIN", "COACH"})
}