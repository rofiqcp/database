package com.example.gdrive.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriveFile {
    private String id;
    private String name;
    private String mimeType;
    private String size;
    private String createdTime;
    private String modifiedTime;
    private String webViewLink;
    private String webContentLink;
    private String parents;
    private boolean trashed;
}
