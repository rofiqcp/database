package com.example.gdrive.controller;

import com.example.gdrive.service.GoogleDocsService;
import com.google.api.services.docs.v1.model.BatchUpdateDocumentResponse;
import com.google.api.services.docs.v1.model.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/docs")
public class DocsController {

    private static final Logger logger = LoggerFactory.getLogger(DocsController.class);

    private final GoogleDocsService docsService;

    @Autowired
    public DocsController(GoogleDocsService docsService) {
        this.docsService = docsService;
    }

    /**
     * GET /api/docs/{documentId}
     * Returns the document metadata and extracted plain text.
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocument(@PathVariable String documentId) {
        try {
            Document doc = docsService.getDocument(documentId);
            String plainText = docsService.extractPlainText(doc);
            return ResponseEntity.ok(Map.of(
                    "documentId", doc.getDocumentId(),
                    "title", doc.getTitle(),
                    "plainText", plainText,
                    "revisionId", doc.getRevisionId() != null ? doc.getRevisionId() : ""
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching document {}", documentId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/docs/create
     * Creates a new Google Doc with the given title.
     * Body: { "title": "My Document" }
     */
    @PostMapping("/create")
    public ResponseEntity<?> createDocument(@RequestBody Map<String, String> body) {
        try {
            String title = body.getOrDefault("title", "Untitled Document");
            Document doc = docsService.createDocument(title);
            return ResponseEntity.ok(Map.of(
                    "documentId", doc.getDocumentId(),
                    "title", doc.getTitle(),
                    "message", "Document created successfully"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating document", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/docs/{documentId}/append
     * Appends plain text to the end of an existing document.
     * Body: { "text": "New paragraph content" }
     */
    @PostMapping("/{documentId}/append")
    public ResponseEntity<?> appendText(
            @PathVariable String documentId,
            @RequestBody Map<String, String> body) {
        try {
            String text = body.get("text");
            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "text field is required"));
            }
            BatchUpdateDocumentResponse response = docsService.appendText(documentId, text);
            return ResponseEntity.ok(Map.of(
                    "documentId", documentId,
                    "message", "Text appended successfully",
                    "replies", response.getReplies() != null ? response.getReplies().size() : 0
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error appending to document {}", documentId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/docs/{documentId}/replace
     * Replaces all occurrences of a string in the document.
     * Body: { "search": "old text", "replacement": "new text" }
     */
    @PutMapping("/{documentId}/replace")
    public ResponseEntity<?> replaceText(
            @PathVariable String documentId,
            @RequestBody Map<String, String> body) {
        try {
            String search = body.get("search");
            String replacement = body.get("replacement");
            if (search == null || replacement == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "search and replacement fields are required"));
            }
            BatchUpdateDocumentResponse response = docsService.replaceText(documentId, search, replacement);
            return ResponseEntity.ok(Map.of(
                    "documentId", documentId,
                    "message", "Text replaced successfully"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error replacing text in document {}", documentId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
