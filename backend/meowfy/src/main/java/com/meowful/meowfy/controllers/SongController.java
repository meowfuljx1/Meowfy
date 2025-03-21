package com.meowful.meowfy.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.meowful.meowfy.models.SongDTO;
import com.meowful.meowfy.services.SongService;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
@CrossOrigin(origins = "${FRONTEND_URL}") // разрешить запросы с этого хоста
public class SongController {
    private final SongService service;

    @GetMapping("/all")
    public ResponseEntity<List<SongDTO>> getAllSongs(){
        List<SongDTO> songsDTO = service.getAllSongs();
        
        if (!songsDTO.isEmpty())
            return ResponseEntity.ok(songsDTO);
        else
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    @PostMapping("/upload")
    public void uploadSong(List<MultipartFile> files){
        service.uploadSong(files);
    }

    @GetMapping("/play/{id}")
    public ResponseEntity<byte[]> getSong(@PathVariable Long id){
        return service.getSong(id);
    }
}
