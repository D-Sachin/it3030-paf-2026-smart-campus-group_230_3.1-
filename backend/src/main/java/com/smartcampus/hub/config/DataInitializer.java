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
            if (userRepository.count() == 0) {
                System.out.println("Initializing default user accounts...");

                User admin = new User();
                admin.setName("John Admin");
                admin.setEmail("admin@smartcampus.com");
                admin.setRole("ADMIN");

                User technician = new User();
                technician.setName("Mike Technician");
                technician.setEmail("tech@smartcampus.com");
                technician.setRole("TECHNICIAN");

                User student = new User();
                student.setName("Sarah Student");
                student.setEmail("student@smartcampus.com");
                student.setRole("USER");

                userRepository.saveAll(List.of(admin, technician, student));

                System.out.println("Default user accounts initialized successfully.");
                System.out.println("- Admin: admin@smartcampus.com");
                System.out.println("- Tech: tech@smartcampus.com");
                System.out.println("- User: student@smartcampus.com");
            } else {
                System.out.println("Users already exist in the database, skipping initialization.");
            }
        };
    }
}
