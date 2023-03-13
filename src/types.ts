export type User = {
    id: number,
    username: string,
    email: string,
    password: string,
    is_admin: boolean,
    signup_date: Date,
    last_login: Date,
}

export type Categories = {
    id: number,
    name: string,
    slug: string,
    description?: string,
    created?: Date,
    updated?: Date,
}

export type Questions = {
    id: number,
    title: string,
    description: string,
    category_id: number,
    created: Date,
    updated: Date,
}

export type Answers = {
    id: number,
    question_id: number,
    answer: string,
    fake_answer_1: string,
    fake_answer_2: string,
    fake_answer_3: string,
    created: Date,
    updated: Date,
}