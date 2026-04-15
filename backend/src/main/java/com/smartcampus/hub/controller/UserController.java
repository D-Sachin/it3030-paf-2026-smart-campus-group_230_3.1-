package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserSummaryDTO>> getUsersByRole(@PathVariable String role) {
        List<User> users = userRepository.findByRole(role);
        List<UserSummaryDTO> dtos = users.stream()
                .map(user -> new UserSummaryDTO(user.getId(), user.getName(), user.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Inner DTO for simple user info
    public record UserSummaryDTO(Long id, String name, String email) {}
}
