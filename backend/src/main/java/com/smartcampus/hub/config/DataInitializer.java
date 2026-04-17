package com.smartcampus.hub.config;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * DataInitializer Configuration
 * Automatically seeds the database with default user roles for demonstration purposes
 */
@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            // Ensure default users have passwords for demo
            updateUserWithPassword("admin@smartcampus.com", "John Admin", "ADMIN", "password123", userRepository);
            updateUserWithPassword("tech@smartcampus.com", "Mike Technician", "TECHNICIAN", "password123", userRepository);
            updateUserWithPassword("student@smartcampus.com", "Sarah Student", "USER", "password123", userRepository);
        };
    }

    private void updateUserWithPassword(String email, String name, String role, String password, UserRepository userRepository) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                if (user.getPassword() == null || user.getPassword().isEmpty()) {
                    user.setPassword(password);
                    userRepository.save(user);
                    System.out.println("Updated password for: " + email);
                }
            },
            () -> {
                User user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setRole(role);
                user.setPassword(password);
                userRepository.save(user);
                System.out.println("Created default user: " + email);
            }
        );
    }
}
