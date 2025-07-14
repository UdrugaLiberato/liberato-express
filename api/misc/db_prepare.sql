DROP TABLE member;
DROP TABLE task;
DROP TABLE volunteer;
DROP TABLE emails;

CREATE TABLE image2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    src VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    mime VARCHAR(255),

    category_id VARCHAR(255) COLLATE utf8mb4_unicode_ci,
    location_id VARCHAR(255) COLLATE utf8mb4_unicode_ci,

    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE SET NULL
);

INSERT INTO image2 (src, name, mime, category_id)
SELECT i.src, i.name, i.mime, ci.category_id
FROM image i
JOIN category_image ci ON i.id = ci.image_id;

INSERT INTO image2 (src, name, mime, location_id)
SELECT i.src, i.name, i.mime, il.location_id
FROM image i
JOIN image_location il ON i.id = il.image_id;

drop table image_location;
drop table category_image;
drop table image;

RENAME TABLE image2 TO image;

/*
     rampa     stepenice    =
      0         0           1
      1         0           1
      0         1           0
      1         1           1
*/

INSERT INTO question (id, category_id, question, created_at)
SELECT UUID(), c.category_id, 'Pristupacni ulaz', NOW()
FROM (
         SELECT DISTINCT qr.category_id
         FROM question qr
                  JOIN question qs ON qs.category_id = qr.category_id
         WHERE qr.question = 'Rampa'
           AND qs.question = 'Stepenice'
     ) AS c
         LEFT JOIN question q ON q.category_id = c.category_id AND q.question = 'Pristupacni ulaz'
WHERE q.id IS NULL;


INSERT INTO answer (id, location_id, answer, created_at, question_id)
SELECT
    UUID(),
    r.location_id,
    CASE
        WHEN r.answer = 0 AND s.answer = 1 THEN 0
        ELSE 1
        END AS pristupacni_ulaz_answer,
    NOW(),
    pu.id
FROM location l
 JOIN answer r ON r.location_id = l.id
 JOIN question qr ON r.question_id = qr.id AND qr.question = 'Rampa'
 JOIN answer s ON s.location_id = l.id
 JOIN question qs ON s.question_id = qs.id AND qs.question = 'Stepenice'
 AND qs.category_id = qr.category_id
 JOIN question pu ON pu.question = 'Pristupacni ulaz'
 AND pu.category_id = qr.category_id
 LEFT JOIN answer existing ON existing.location_id = l.id
 AND existing.question_id = pu.id
WHERE existing.id IS NULL;
