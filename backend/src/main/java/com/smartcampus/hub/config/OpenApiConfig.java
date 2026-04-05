package com.smartcampus.hub.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Smart Campus Operations Hub API",
        version = "v1",
        description = "REST API documentation for the Smart Campus Operations Hub backend.",
        contact = @Contact(name = "Smart Campus Team"),
        license = @License(name = "Internal Use")
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local server")
    }
)
public class OpenApiConfig {
}
