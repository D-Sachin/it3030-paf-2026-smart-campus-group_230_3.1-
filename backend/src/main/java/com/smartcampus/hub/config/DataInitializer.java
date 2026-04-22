package com.smartcampus.hub.config;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.model.FAQ;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.repository.FAQRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * DataInitializer Configuration
 * Automatically seeds the database with default user roles and FAQs for demonstration purposes
 */
@Configuration
public class DataInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, FAQRepository faqRepository) {
        return args -> {
            LOGGER.info("Synchronizing demo users for development login");
            syncDemoUser("admin@smartcampus.com", "John Admin", "ADMIN", "password123", userRepository);
            syncDemoUser("tech@smartcampus.com", "Mike Technician", "TECHNICIAN", "password123", userRepository);
            syncDemoUser("student@smartcampus.com", "Sarah Student", "USER", "password123", userRepository);
            LOGGER.info("Demo user synchronization completed");

            LOGGER.info("Initializing default FAQs");
            initializeFAQs(faqRepository);
            LOGGER.info("FAQ initialization completed");
        };
    }

    private void syncDemoUser(String email, String name, String role, String password, UserRepository userRepository) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                user.setName(name);
                user.setRole(role);
                user.setPassword(password);
                user.setTwoFactorSecret(null);
                user.setTwoFactorEnabled(false);
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

    private void initializeFAQs(FAQRepository faqRepository) {
        if (faqRepository.count() > 0) {
            LOGGER.info("FAQs already exist, skipping initialization");
            return;
        }

        faqRepository.save(FAQ.builder()
            .question("How quickly will support respond?")
            .answer("Most questions receive a response within one business day. Urgent campus service issues are prioritized.")
            .build());

        faqRepository.save(FAQ.builder()
            .question("What details should I include in my message?")
            .answer("Include the feature/page name, what happened, and any error text you saw. Clear details help us resolve issues faster.")
            .build());

        faqRepository.save(FAQ.builder()
            .question("Can I request booking or ticketing guidance here?")
            .answer("Yes. Use this page for help with resources, bookings, incidents, and general SmartCampus Hub workflows.")
            .build());

        faqRepository.save(FAQ.builder()
            .question("Is this form available to all users?")
            .answer("Yes. The Help and Support page is available for all logged-in users.")
            .build());

        LOGGER.info("Default FAQs created successfully");
    }
}
