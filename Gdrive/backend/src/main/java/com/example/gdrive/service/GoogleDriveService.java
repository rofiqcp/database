package com.example.gdrive.service;

import com.example.gdrive.model.DriveFile;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoogleDriveService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleDriveService.class);
    private static final String APPLICATION_NAME = "GDrive Spring Boot App";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final GoogleAuthService authService;

    @Autowired
    public GoogleDriveService(GoogleAuthService authService) {
        this.authService = authService;
    }

    private Drive getDriveService() throws IOException, GeneralSecurityException {
        Credential credential = authService.loadCredential();
        if (credential == null) {
            throw new IllegalStateException("Not authenticated. Please complete OAuth2 flow first.");
        }
        return new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    /**
     * Lists files in the user's Google Drive (non-trashed, up to pageSize results).
     */
    public List<DriveFile> listFiles(int pageSize, String pageToken, String query) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();

        Drive.Files.List request = service.files().list()
                .setPageSize(pageSize)
                .setFields("nextPageToken, files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents,trashed)")
                .setOrderBy("modifiedTime desc");

        // Build query: always exclude trashed files, optionally filter by name
        String baseQuery = "trashed = false";
        if (query != null && !query.isBlank()) {
            baseQuery += " and name contains '" + query.replace("'", "\\'") + "'";
        }
        request.setQ(baseQuery);

        if (pageToken != null && !pageToken.isBlank()) {
            request.setPageToken(pageToken);
        }

        FileList result = request.execute();
        List<File> files = result.getFiles();
        if (files == null) {
            return Collections.emptyList();
        }

        return files.stream().map(this::mapToModel).collect(Collectors.toList());
    }

    /**
     * Gets metadata for a single file.
     */
    public DriveFile getFile(String fileId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();
        File file = service.files().get(fileId)
                .setFields("id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents,trashed")
                .execute();
        return mapToModel(file);
    }

    /**
     * Downloads a file and writes it to the returned byte array.
     */
    public byte[] downloadFile(String fileId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        service.files().get(fileId).executeMediaAndDownloadTo(out);
        return out.toByteArray();
    }

    /**
     * Uploads a multipart file to the root of Google Drive.
     */
    public DriveFile uploadFile(MultipartFile multipartFile, String folderId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();

        File fileMetadata = new File();
        fileMetadata.setName(multipartFile.getOriginalFilename());
        if (folderId != null && !folderId.isBlank()) {
            fileMetadata.setParents(Collections.singletonList(folderId));
        }

        InputStreamContent mediaContent = new InputStreamContent(
                multipartFile.getContentType(),
                new BufferedInputStream(multipartFile.getInputStream()));
        mediaContent.setLength(multipartFile.getSize());

        File uploadedFile = service.files().create(fileMetadata, mediaContent)
                .setFields("id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents,trashed")
                .execute();

        logger.info("Uploaded file: {} ({})", uploadedFile.getName(), uploadedFile.getId());
        return mapToModel(uploadedFile);
    }

    /**
     * Moves a file to the trash (soft delete).
     */
    public void deleteFile(String fileId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();
        File trashUpdate = new File();
        trashUpdate.setTrashed(true);
        service.files().update(fileId, trashUpdate).execute();
        logger.info("File {} moved to trash.", fileId);
    }

    /**
     * Permanently deletes a file.
     */
    public void permanentlyDeleteFile(String fileId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();
        service.files().delete(fileId).execute();
        logger.info("File {} permanently deleted.", fileId);
    }

    private DriveFile mapToModel(File file) {
        return DriveFile.builder()
                .id(file.getId())
                .name(file.getName())
                .mimeType(file.getMimeType())
                .size(file.getSize() != null ? file.getSize().toString() : "0")
                .createdTime(file.getCreatedTime() != null ? file.getCreatedTime().toStringRfc3339() : null)
                .modifiedTime(file.getModifiedTime() != null ? file.getModifiedTime().toStringRfc3339() : null)
                .webViewLink(file.getWebViewLink())
                .webContentLink(file.getWebContentLink())
                .parents(file.getParents() != null ? String.join(",", file.getParents()) : null)
                .trashed(Boolean.TRUE.equals(file.getTrashed()))
                .build();
    }
}
