package com.meowful.meowfy.services;

import com.meowful.meowfy.models.Song;
import com.meowful.meowfy.models.SongDTO;
import com.meowful.meowfy.repositories.SongRepository;
import lombok.RequiredArgsConstructor;
import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import org.jaudiotagger.tag.FieldKey;
import org.jaudiotagger.tag.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SongService {
    private final SongRepository repository;

    public ResponseEntity<byte[]> getSong(Long id){
        Song song = repository.getSongsById(id);
        byte [] songData = song.getAudio();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
        return new ResponseEntity<>(songData, headers, HttpStatus.OK);
    }
    public List<SongDTO> getAllSongs() {
        return repository.findAll().stream().map(song -> new SongDTO(song.getId(), song.getTitle(), song.getArtist(), song.getDuration(), song.getCover())).toList();
    }

    public void uploadSong(List<MultipartFile> multipartFiles) {
        for (MultipartFile multipartFile : multipartFiles) {
            try {
                Song song = new Song();
                song.setAudio(multipartFile.getBytes()); // audio

                // Jaudiotagger
                // создаем temp file в стандартном временном каталоге системы
                File tempFile = Files.createTempFile("tempFile", ".mp3").toFile();
                multipartFile.transferTo(tempFile); // записываем multipart file в file
                AudioFile audioFile = AudioFileIO.read(tempFile);
                Tag tag = audioFile.getTag();

                // title
                String title = tag.getFirst(FieldKey.TITLE);
                song.setTitle(title);
                // artist
                String artist = tag.getFirst(FieldKey.ARTIST);
                song.setArtist(artist);
                //duration
                int durationSecs = audioFile.getAudioHeader().getTrackLength();
                String formattedDuration = formatDuration(durationSecs);
                song.setDuration(formattedDuration);
                // cover
                byte[] cover = tag.getFirstArtwork().getBinaryData();
                song.setCover(cover);

                repository.save(song);
                System.out.println("Добавлена песня: " + artist + " - " + title + "!");
            } catch (Exception e) {
                System.out.println("""
                        Ошибка при записи файла в базу данных!
                        Проверьте, есть ли в метаданных песни следующие поля:
                        название, артист, обложка""");
                e.printStackTrace();
            }
        }
    }


    private String formatDuration(int duration) {
        int mins = duration / 60;
        int secs = duration % 60;
        return String.format("%d:%02d", mins, secs);
    }
}
