package com.example.gdrive.controller;

import com.example.gdrive.service.GoogleSheetsService;
import com.google.api.services.sheets.v4.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sheets")
public class SheetsController {

    private static final Logger logger = LoggerFactory.getLogger(SheetsController.class);

    private final GoogleSheetsService sheetsService;

    @Autowired
    public SheetsController(GoogleSheetsService sheetsService) {
        this.sheetsService = sheetsService;
    }

    /**
     * GET /api/sheets/{spreadsheetId}
     * Returns spreadsheet metadata (title and sheet names).
     */
    @GetMapping("/{spreadsheetId}")
    public ResponseEntity<?> getSpreadsheet(@PathVariable String spreadsheetId) {
        try {
            Spreadsheet spreadsheet = sheetsService.getSpreadsheet(spreadsheetId);
            return ResponseEntity.ok(Map.of(
                    "spreadsheetId", spreadsheet.getSpreadsheetId(),
                    "title", spreadsheet.getProperties().getTitle(),
                    "sheets", spreadsheet.getSheets().stream()
                            .map(s -> Map.of(
                                    "sheetId", s.getProperties().getSheetId(),
                                    "title", s.getProperties().getTitle(),
                                    "index", s.getProperties().getIndex()))
                            .toList()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching spreadsheet metadata", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/sheets/{spreadsheetId}/values?range=Sheet1!A1:D10
     * Reads cell values from the given A1-notation range.
     */
    @GetMapping("/{spreadsheetId}/values")
    public ResponseEntity<?> getValues(
            @PathVariable String spreadsheetId,
            @RequestParam(defaultValue = "Sheet1") String range) {
        try {
            ValueRange valueRange = sheetsService.readValues(spreadsheetId, range);
            return ResponseEntity.ok(Map.of(
                    "range", valueRange.getRange(),
                    "values", valueRange.getValues() != null ? valueRange.getValues() : List.of(),
                    "rowCount", valueRange.getValues() != null ? valueRange.getValues().size() : 0));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error reading sheet values", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/sheets/{spreadsheetId}/values
     * Writes values to the specified range.
     * Body: { "range": "Sheet1!A1", "values": [[...], [...]] }
     */
    @PutMapping("/{spreadsheetId}/values")
    public ResponseEntity<?> writeValues(
            @PathVariable String spreadsheetId,
            @RequestBody Map<String, Object> body) {
        try {
            String range = (String) body.get("range");
            @SuppressWarnings("unchecked")
            List<List<Object>> values = (List<List<Object>>) body.get("values");

            if (range == null || values == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "range and values are required"));
            }

            UpdateValuesResponse result = sheetsService.writeValues(spreadsheetId, range, values);
            return ResponseEntity.ok(Map.of(
                    "updatedRange", result.getUpdatedRange(),
                    "updatedRows", result.getUpdatedRows(),
                    "updatedColumns", result.getUpdatedColumns(),
                    "updatedCells", result.getUpdatedCells()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error writing sheet values", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/sheets/{spreadsheetId}/values
     * Appends rows after the last data row in the specified range.
     * Body: { "range": "Sheet1!A1", "values": [[...]] }
     */
    @PostMapping("/{spreadsheetId}/values")
    public ResponseEntity<?> appendValues(
            @PathVariable String spreadsheetId,
            @RequestBody Map<String, Object> body) {
        try {
            String range = (String) body.get("range");
            @SuppressWarnings("unchecked")
            List<List<Object>> values = (List<List<Object>>) body.get("values");

            if (range == null || values == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "range and values are required"));
            }

            AppendValuesResponse result = sheetsService.appendValues(spreadsheetId, range, values);
            return ResponseEntity.ok(Map.of(
                    "spreadsheetId", result.getSpreadsheetId(),
                    "tableRange", result.getTableRange() != null ? result.getTableRange() : "",
                    "updates", result.getUpdates() != null ? Map.of(
                            "updatedRange", result.getUpdates().getUpdatedRange(),
                            "updatedRows", result.getUpdates().getUpdatedRows(),
                            "updatedCells", result.getUpdates().getUpdatedCells()) : Map.of()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error appending sheet values", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/sheets/{spreadsheetId}/values?range=Sheet1!A1:D10
     * Clears values in the given range.
     */
    @DeleteMapping("/{spreadsheetId}/values")
    public ResponseEntity<?> clearValues(
            @PathVariable String spreadsheetId,
            @RequestParam String range) {
        try {
            ClearValuesResponse result = sheetsService.clearValues(spreadsheetId, range);
            return ResponseEntity.ok(Map.of(
                    "clearedRange", result.getClearedRange() != null ? result.getClearedRange() : range));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error clearing sheet values", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
