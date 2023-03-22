CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
);

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(256) NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE public.questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(1000) DEFAULT '',
    category_id INTEGER NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE
);

CREATE TABLE public.answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    answer VARCHAR(1000) NOT NULL,
    fake_answer_1 VARCHAR(1000) NOT NULL,
    fake_answer_2 VARCHAR(1000) NOT NULL,
    fake_answer_3 VARCHAR(1000) NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_questions_id FOREIGN KEY (question_id) REFERENCES public.questions (id) ON DELETE CASCADE
);

CREATE TABLE public.scores (
    id SERIAL PRIMARY KEY,
    -- Síðan "ALTER TABLE ADD COLUMN" þegar nýtt categories er bætt við
);