package com.example.gdrive.service;

import com.example.gdrive.config.GoogleConfig;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.StoredCredential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;

@Service
public class GoogleAuthService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthService.class);
    private static final String USER_ID = "user";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final GoogleConfig googleConfig;
    private GoogleAuthorizationCodeFlow flow;
    private Credential cachedCredential;
    @Autowired
    public GoogleAuthService(GoogleConfig googleConfig) {
        this.googleConfig = googleConfig;
    }

    /**
     * Initialises (or reuses) the GoogleAuthorizationCodeFlow.
     * The data-store factory points at the directory that holds tokens.json.
     */
    private GoogleAuthorizationCodeFlow getFlow() throws IOException, GeneralSecurityException {
        if (flow != null) {
            return flow;
        }

        File credentialsFile = new File(googleConfig.getCredentialsFilePath());
        if (!credentialsFile.exists()) {
            throw new FileNotFoundException(
                    "credentials.json not found at: " + credentialsFile.getAbsolutePath()
                            + ". Download it from Google Cloud Console and place it there.");
        }

        try (InputStream in = new FileInputStream(credentialsFile)) {
            GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

            // Store tokens in the same directory as credentials
            File tokenDir = new File(googleConfig.getTokensFilePath()).getParentFile();
            tokenDir.mkdirs();

            flow = new GoogleAuthorizationCodeFlow.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JSON_FACTORY,
                    clientSecrets,
                    GoogleConfig.SCOPES)
                    .setDataStoreFactory(new FileDataStoreFactory(tokenDir))
                    .setAccessType("offline")
                    .build();
        }
        return flow;
    }

    /**
     * Returns true when a valid (or refreshable) credential exists on disk.
     */
    public boolean isAuthenticated() {
        try {
            Credential credential = loadCredential();
            return credential != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Builds the Google OAuth2 consent-screen URL.
     */
    public String getAuthorizationUrl() throws IOException, GeneralSecurityException {
        return getFlow()
                .newAuthorizationUrl()
                .setRedirectUri(googleConfig.getRedirectUri())
                .build();
    }

    /**
     * Exchanges the authorisation code for tokens and persists them.
     */
    public void exchangeCodeForTokens(String code) throws IOException, GeneralSecurityException {
        GoogleAuthorizationCodeFlow authFlow = getFlow();
        TokenResponse tokenResponse = authFlow
                .newTokenRequest(code)
                .setRedirectUri(googleConfig.getRedirectUri())
                .execute();

        authFlow.createAndStoreCredential(tokenResponse, USER_ID);
        cachedCredential = null; // force reload next time
        logger.info("Tokens saved successfully.");
    }

    /**
     * Loads the stored credential, refreshing the access token if needed.
     */
    public Credential loadCredential() throws IOException, GeneralSecurityException {
        if (cachedCredential != null) {
            refreshIfExpired(cachedCredential);
            return cachedCredential;
        }

        Credential credential = getFlow().loadCredential(USER_ID);
        if (credential == null) {
            return null;
        }

        refreshIfExpired(credential);
        cachedCredential = credential;
        return credential;
    }

    private void refreshIfExpired(Credential credential) throws IOException {
        Long expiresIn = credential.getExpiresInSeconds();
        if (expiresIn == null || expiresIn < 60) {
            logger.info("Access token expired or expiring soon, refreshing…");
            credential.refreshToken();
        }
    }

    /**
     * Deletes the stored tokens so the user must re-authenticate.
     */
    public void logout() {
        cachedCredential = null;
        flow = null;
        Path tokenDir = Paths.get(googleConfig.getTokensFilePath()).getParent();
        // FileDataStoreFactory writes files named after the data-store id inside the directory
        try {
            Files.walk(tokenDir)
                    .filter(p -> p.getFileName().toString().startsWith(StoredCredential.DEFAULT_DATA_STORE_ID))
                    .forEach(p -> {
                        try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                    });
            logger.info("Tokens cleared.");
        } catch (IOException e) {
            logger.warn("Could not clear token files: {}", e.getMessage());
        }
    }
}
