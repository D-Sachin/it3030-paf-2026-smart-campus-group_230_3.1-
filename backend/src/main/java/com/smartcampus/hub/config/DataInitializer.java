package com.smartcampus.hub.config;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * DataInitializer Configuration
 * Automatically seeds the database with default user roles for demonstration purposes
 */
@Configuration
public class DataInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            LOGGER.info("Synchronizing demo users for development login");
            syncDemoUser("admin@smartcampus.com", "John Admin", "ADMIN", "password123", userRepository);
            syncDemoUser("tech@smartcampus.com", "Mike Technician", "TECHNICIAN", "password123", userRepository);
            syncDemoUser("student@smartcampus.com", "Sarah Student", "USER", "password123", userRepository);
            LOGGER.info("Demo user synchronization completed");
        };
    }

    private void syncDemoUser(String email, String name, String role, String password, UserRepository userRepository) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                user.setName(name);
                user.setRole(role);
                user.setPassword(password);
                userRepository.save(user);
                LOGGER.info("Updated demo user: {}", email);
            },
            () -> {
                User user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setRole(role);
                user.setPassword(password);
                userRepository.save(user);
                LOGGER.info("Created demo user: {}", email);
            }
        );
    }
}
