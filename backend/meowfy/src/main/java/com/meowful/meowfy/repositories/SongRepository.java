package com.meowful.meowfy.repositories;

import com.meowful.meowfy.models.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {
    Song getSongsById(Long id);
}
