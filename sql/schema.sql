CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.exams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(256) NOT NULL,
    image VARCHAR(256) NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(64) NOT NULL UNIQUE,
    question_id VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(256) DEFAULT '',
    image VARCHAR(256) DEFAULT '',
    answer VARCHAR(256) NOT NULL,
    fake_answer_1 VARCHAR(256) NOT NULL,
    fake_answer_2 VARCHAR(256) NOT NULL,
    fake_answer_3 VARCHAR(256) NOT NULL,
    exam_id INTEGER NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.scores (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exam_1 INTEGER DEFAULT NULL,
    exam_2 INTEGER DEFAULT NULL,
    exam_3 INTEGER DEFAULT NULL,
    CONSTRAINT scores_player_id_unique UNIQUE (player_id)
);
