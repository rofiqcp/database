package com.example.gdrive.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class GoogleConfig {

    @Value("${google.credentials.file-path:credentials/credentials.json}")
    private String credentialsFilePath;

    @Value("${google.tokens.file-path:credentials/tokens.json}")
    private String tokensFilePath;

    @Value("${google.redirect-uri:http://localhost:8080/api/auth/callback}")
    private String redirectUri;

    public static final List<String> SCOPES = Arrays.asList(
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/documents"
    );

    public String getCredentialsFilePath() {
        return credentialsFilePath;
    }

    public String getTokensFilePath() {
        return tokensFilePath;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
