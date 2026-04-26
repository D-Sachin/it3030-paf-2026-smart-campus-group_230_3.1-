package com.smartcampus.hub.dto;

public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean twoFactorEnabled;

    public UserProfileDTO() {}

    public UserProfileDTO(Long id, String name, String email, String role, boolean twoFactorEnabled) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }

    public static UserProfileDTOBuilder builder() {
        return new UserProfileDTOBuilder();
    }

    public static class UserProfileDTOBuilder {
        private Long id;
        private String name;
        private String email;
        private String role;
        private boolean twoFactorEnabled;

        public UserProfileDTOBuilder id(Long id) { this.id = id; return this; }
        public UserProfileDTOBuilder name(String name) { this.name = name; return this; }
        public UserProfileDTOBuilder email(String email) { this.email = email; return this; }
        public UserProfileDTOBuilder role(String role) { this.role = role; return this; }
        public UserProfileDTOBuilder twoFactorEnabled(boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; return this; }

        public UserProfileDTO build() {
            return new UserProfileDTO(id, name, email, role, twoFactorEnabled);
        }
    }
}
