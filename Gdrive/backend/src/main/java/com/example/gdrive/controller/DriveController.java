package com.example.gdrive.controller;

import com.example.gdrive.model.DriveFile;
import com.example.gdrive.service.GoogleDriveService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drive")
public class DriveController {

    private static final Logger logger = LoggerFactory.getLogger(DriveController.class);

    private final GoogleDriveService driveService;

    @Autowired
    public DriveController(GoogleDriveService driveService) {
        this.driveService = driveService;
    }

    /**
     * GET /api/drive/root
     * Returns the configured root folder ID used as the database.
     */
    @GetMapping("/root")
    public ResponseEntity<?> getRootFolder() {
        String rootId = driveService.getRootFolderId();
        if (rootId == null || rootId.isBlank()) {
            return ResponseEntity.ok(Map.of("rootFolderId", (Object) null, "message", "No root folder configured"));
        }
        try {
            DriveFile folder = driveService.getFile(rootId);
            return ResponseEntity.ok(Map.of("rootFolderId", rootId, "folder", folder));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("rootFolderId", rootId));
        }
    }

    /**
     * GET /api/drive/files
     * Lists files from a specific folder (defaults to the root database folder).
     */
    @GetMapping("/files")
    public ResponseEntity<?> listFiles(
            @RequestParam(defaultValue = "100") int pageSize,
            @RequestParam(required = false) String pageToken,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String folderId) {
        try {
            List<DriveFile> files = driveService.listFiles(pageSize, pageToken, query, folderId);
            return ResponseEntity.ok(Map.of("files", files, "count", files.size(),
                    "folderId", folderId != null ? folderId : driveService.getRootFolderId()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error listing files", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/drive/files/{id}
     * Returns metadata for a single file.
     */
    @GetMapping("/files/{id}")
    public ResponseEntity<?> getFile(@PathVariable String id) {
        try {
            DriveFile file = driveService.getFile(id);
            return ResponseEntity.ok(file);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error getting file {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/drive/files/{id}/download
     * Downloads file content as bytes.
     */
    @GetMapping("/files/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String id) {
        try {
            DriveFile meta = driveService.getFile(id);
            byte[] content = driveService.downloadFile(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getName() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(content);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            logger.error("Error downloading file {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/drive/upload
     * Uploads a file to Google Drive.
     * Accepts multipart/form-data with "file" field and optional "folderId".
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String folderId) {
        try {
            DriveFile uploaded = driveService.uploadFile(file, folderId);
            return ResponseEntity.ok(uploaded);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error uploading file", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/drive/delete/{id}
     * Moves a file to the trash (soft delete).
     * Pass ?permanent=true to permanently delete.
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFile(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean permanent) {
        try {
            if (permanent) {
                driveService.permanentlyDeleteFile(id);
            } else {
                driveService.deleteFile(id);
            }
            return ResponseEntity.ok(Map.of(
                    "message", permanent ? "File permanently deleted" : "File moved to trash",
                    "fileId", id));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting file {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
