package com.meowful.meowfy.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "songs")
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String artist;
    private String duration;

    @Lob
    @Column(name = "cover", columnDefinition = "LONGBLOB")
    private byte[] cover;

    @Lob
    @Column(name = "audio", columnDefinition = "LONGBLOB")
    private byte[] audio;
}
