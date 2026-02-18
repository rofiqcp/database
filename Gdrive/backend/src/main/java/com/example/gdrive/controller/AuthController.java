package com.example.gdrive.controller;

import com.example.gdrive.service.GoogleAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final GoogleAuthService authService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    public AuthController(GoogleAuthService authService) {
        this.authService = authService;
    }

    /**
     * GET /api/auth/url
     * Returns the Google OAuth2 consent URL. The client should redirect the browser to this URL.
     */
    @GetMapping("/url")
    public ResponseEntity<?> getAuthUrl() {
        try {
            String url = authService.getAuthorizationUrl();
            return ResponseEntity.ok(Map.of("authUrl", url));
        } catch (Exception e) {
            logger.error("Failed to build auth URL", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/auth/callback
     * Receives the authorisation code from Google after the user grants access.
     * Exchanges it for tokens, saves them, then redirects back to the frontend.
     */
    @GetMapping("/callback")
    public void handleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            jakarta.servlet.http.HttpServletResponse response) throws Exception {

        if (error != null) {
            logger.warn("OAuth2 error: {}", error);
            response.sendRedirect(frontendUrl + "?auth=error&reason=" + error);
            return;
        }

        if (code == null || code.isBlank()) {
            response.sendRedirect(frontendUrl + "?auth=error&reason=no_code");
            return;
        }

        try {
            authService.exchangeCodeForTokens(code);
            logger.info("OAuth2 tokens saved successfully.");
            response.sendRedirect(frontendUrl + "?auth=success");
        } catch (Exception e) {
            logger.error("Token exchange failed", e);
            response.sendRedirect(frontendUrl + "?auth=error&reason=token_exchange_failed");
        }
    }

    /**
     * GET /api/auth/status
     * Returns whether the user is currently authenticated.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        boolean authenticated = authService.isAuthenticated();
        return ResponseEntity.ok(Map.of(
                "authenticated", authenticated,
                "message", authenticated ? "Authenticated with Google" : "Not authenticated"
        ));
    }

    /**
     * POST /api/auth/logout
     * Deletes stored tokens and invalidates the session.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        authService.logout();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
