package com.example.gdrive.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
public class GoogleSheetsService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleSheetsService.class);
    private static final String APPLICATION_NAME = "GDrive Spring Boot App";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final GoogleAuthService authService;

    @Autowired
    public GoogleSheetsService(GoogleAuthService authService) {
        this.authService = authService;
    }

    private Sheets getSheetsService() throws IOException, GeneralSecurityException {
        Credential credential = authService.loadCredential();
        if (credential == null) {
            throw new IllegalStateException("Not authenticated. Please complete OAuth2 flow first.");
        }
        return new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    /**
     * Reads values from a given range (A1 notation), e.g. "Sheet1!A1:D10".
     */
    public ValueRange readValues(String spreadsheetId, String range) throws IOException, GeneralSecurityException {
        Sheets service = getSheetsService();
        ValueRange response = service.spreadsheets().values()
                .get(spreadsheetId, range)
                .execute();
        logger.info("Read {} rows from {}", response.getValues() != null ? response.getValues().size() : 0, range);
        return response;
    }

    /**
     * Writes values to a given range.
     */
    public UpdateValuesResponse writeValues(String spreadsheetId, String range, List<List<Object>> values)
            throws IOException, GeneralSecurityException {
        Sheets service = getSheetsService();
        ValueRange body = new ValueRange().setValues(values);
        UpdateValuesResponse result = service.spreadsheets().values()
                .update(spreadsheetId, range, body)
                .setValueInputOption("USER_ENTERED")
                .execute();
        logger.info("Updated {} cells in {}", result.getUpdatedCells(), range);
        return result;
    }

    /**
     * Appends values after the last row that contains data in the given range.
     */
    public AppendValuesResponse appendValues(String spreadsheetId, String range, List<List<Object>> values)
            throws IOException, GeneralSecurityException {
        Sheets service = getSheetsService();
        ValueRange body = new ValueRange().setValues(values);
        AppendValuesResponse result = service.spreadsheets().values()
                .append(spreadsheetId, range, body)
                .setValueInputOption("USER_ENTERED")
                .setInsertDataOption("INSERT_ROWS")
                .execute();
        logger.info("Appended rows to {}", range);
        return result;
    }

    /**
     * Retrieves spreadsheet metadata (title, sheets list, etc.).
     */
    public Spreadsheet getSpreadsheet(String spreadsheetId) throws IOException, GeneralSecurityException {
        Sheets service = getSheetsService();
        return service.spreadsheets().get(spreadsheetId)
                .setFields("spreadsheetId,properties,sheets.properties")
                .execute();
    }

    /**
     * Clears all values in the given range.
     */
    public ClearValuesResponse clearValues(String spreadsheetId, String range) throws IOException, GeneralSecurityException {
        Sheets service = getSheetsService();
        ClearValuesResponse result = service.spreadsheets().values()
                .clear(spreadsheetId, range, new ClearValuesRequest())
                .execute();
        logger.info("Cleared range {}", range);
        return result;
    }
}
