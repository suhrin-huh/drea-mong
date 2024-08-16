package com.ssafy.dreamong.domain.aws;


import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/files")
public class FileController {

    private final S3UploadService s3UploadService;

    public FileController(S3UploadService s3UploadService) {
        this.s3UploadService = s3UploadService;
    }

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        return s3UploadService.saveFile(file);
    }

    @GetMapping("/download")
    public ResponseEntity<UrlResource> downloadFile(@RequestParam String filename) throws IOException {
        UrlResource urlResource = new UrlResource(s3UploadService.getFileUrl(filename));
        String contentDisposition = "attachment; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .header("Content-Disposition", contentDisposition)
                .body(urlResource);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFile(@RequestParam String filename) {
        s3UploadService.deleteFile(filename);
        return ResponseEntity.ok("File deleted successfully");
    }
}

