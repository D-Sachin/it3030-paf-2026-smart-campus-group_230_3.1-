package com.smartcampus.hub.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * DatabaseMigrationConfig
 * 
 * Automatically drops the outdated check constraint on notifications table 
 * to allow new notification types (like TICKET_UPDATED).
 */
@Configuration
@RequiredArgsConstructor
public class DatabaseMigrationConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner migrateDatabase() {
        return args -> {
            try {
                System.out.println("Running database migration: dropping notifications_type_check constraint if exists...");
                jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
                System.out.println("Database migration active: notifications_type_check constraint dropped successfully.");
            } catch (Exception e) {
                System.err.println("Warning: Could not drop notifications_type_check constraint: " + e.getMessage());
            }
        };
    }
}
