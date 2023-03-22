INSERT INTO
  users (username, email, password, is_admin)
VALUES
  ('admin', 'admin@example.org', '$2b$04$5XvV1IIubvtw.RI3dMmDPumdpr9GQlUM.yWVbUxaRqu/3exbw3mke', true);

INSERT INTO exams (name, slug, description) VALUES ('Exam 1', 'exam-1', 'This is the first exam');
INSERT INTO exams (name, slug, description) VALUES ('Exam 2', 'exam-2', 'This is the second exam');
INSERT INTO exams (name, slug, description) VALUES ('Exam 3', 'exam-3', 'This is the third exam');

INSERT INTO questions (title, description, exam_id) VALUES ('Question 1.1', 'This is the first question in the first exam', 1);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 1.2', 'This is the second question in the first exam', 1);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 1.3', 'This is the third question in the first exam', 1);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 2.1', 'This is the first question in the second exam', 2);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 2.2', 'This is the second question in the second exam', 2);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 2.3', 'This is the third question in the second exam', 2);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 3.1', 'This is the first question in the third exam', 3);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 3.2', 'This is the second question in the third exam', 3);
INSERT INTO questions (title, description, exam_id) VALUES ('Question 3.3', 'This is the third question in the third exam', 3);