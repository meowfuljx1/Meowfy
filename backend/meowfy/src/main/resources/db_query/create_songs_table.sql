CREATE TABLE IF NOT EXISTS songs(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    artist VARCHAR(255),
    duration VARCHAR(5),
    cover LONGBLOB,
    audio LONGBLOB
);
