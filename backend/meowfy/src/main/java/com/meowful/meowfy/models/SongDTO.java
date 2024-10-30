package com.meowful.meowfy.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SongDTO {
    private Long id;
    private String title;
    private String artist;
    private String duration;
    private byte[] cover;
}
