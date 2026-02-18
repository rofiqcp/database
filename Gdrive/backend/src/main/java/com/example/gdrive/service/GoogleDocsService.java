package com.example.gdrive.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.docs.v1.Docs;
import com.google.api.services.docs.v1.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleDocsService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleDocsService.class);
    private static final String APPLICATION_NAME = "GDrive Spring Boot App";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final GoogleAuthService authService;

    @Autowired
    public GoogleDocsService(GoogleAuthService authService) {
        this.authService = authService;
    }

    private Docs getDocsService() throws IOException, GeneralSecurityException {
        Credential credential = authService.loadCredential();
        if (credential == null) {
            throw new IllegalStateException("Not authenticated. Please complete OAuth2 flow first.");
        }
        return new Docs.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    /**
     * Retrieves the full Document object for the given document ID.
     */
    public Document getDocument(String documentId) throws IOException, GeneralSecurityException {
        Docs service = getDocsService();
        return service.documents().get(documentId).execute();
    }

    /**
     * Creates a new Google Doc with the given title and returns it.
     */
    public Document createDocument(String title) throws IOException, GeneralSecurityException {
        Docs service = getDocsService();
        Document doc = new Document().setTitle(title);
        Document created = service.documents().create(doc).execute();
        logger.info("Created document: {} ({})", created.getTitle(), created.getDocumentId());
        return created;
    }

    /**
     * Appends plain text to the end of an existing document.
     * Inserts at the very end of the body content (end index - 1 to avoid the final newline sentinel).
     */
    public BatchUpdateDocumentResponse appendText(String documentId, String text) throws IOException, GeneralSecurityException {
        Docs service = getDocsService();

        // Fetch document to find the end index
        Document doc = service.documents().get(documentId)
                .setFields("body.content")
                .execute();

        int endIndex = getEndIndex(doc);

        // Append a newline + the requested text
        Request insertRequest = new Request()
                .setInsertText(new InsertTextRequest()
                        .setText("\n" + text)
                        .setLocation(new Location().setIndex(endIndex)));

        BatchUpdateDocumentRequest batchRequest = new BatchUpdateDocumentRequest()
                .setRequests(Collections.singletonList(insertRequest));

        BatchUpdateDocumentResponse response = service.documents()
                .batchUpdate(documentId, batchRequest)
                .execute();

        logger.info("Appended text to document {}", documentId);
        return response;
    }

    /**
     * Replaces all occurrences of a search string with a replacement string.
     */
    public BatchUpdateDocumentResponse replaceText(String documentId, String searchText, String replacementText)
            throws IOException, GeneralSecurityException {
        Docs service = getDocsService();

        Request replaceRequest = new Request()
                .setReplaceAllText(new ReplaceAllTextRequest()
                        .setContainsText(new SubstringMatchCriteria()
                                .setText(searchText)
                                .setMatchCase(false))
                        .setReplaceText(replacementText));

        BatchUpdateDocumentRequest batchRequest = new BatchUpdateDocumentRequest()
                .setRequests(Collections.singletonList(replaceRequest));

        return service.documents().batchUpdate(documentId, batchRequest).execute();
    }

    /**
     * Extracts all plain text content from a Document.
     */
    public String extractPlainText(Document document) {
        StringBuilder sb = new StringBuilder();
        if (document.getBody() == null || document.getBody().getContent() == null) {
            return "";
        }
        for (StructuralElement element : document.getBody().getContent()) {
            if (element.getParagraph() != null) {
                for (ParagraphElement pe : element.getParagraph().getElements()) {
                    if (pe.getTextRun() != null && pe.getTextRun().getContent() != null) {
                        sb.append(pe.getTextRun().getContent());
                    }
                }
            }
        }
        return sb.toString();
    }

    /**
     * Returns the last valid insertion index in the document body.
     */
    private int getEndIndex(Document doc) {
        List<StructuralElement> content = doc.getBody().getContent();
        if (content == null || content.isEmpty()) {
            return 1;
        }
        StructuralElement lastElement = content.get(content.size() - 1);
        // The body's last structural element is the terminal newline with endIndex = body size.
        // We insert just before it.
        return lastElement.getEndIndex() - 1;
    }
}
