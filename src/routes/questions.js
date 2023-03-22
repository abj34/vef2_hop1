import { getExamBySlug, insertQuestion } from '../lib/db.js';

export function questionMapper(question) {
    if (!question ||
        !question.id ||
        !question.title ||
        !question.description ||
        !question.exam_id
    ) {
        return null
    }

    const theQuestion = {
        id: question.id,
        title: question.title,
        description: question.description || '',
        exam_id: question.exam_id
    };

    return theQuestion;
}

export function mapDbQuestionsToQuestions(input) {
    if (!input) { return []; }

    const mappedQuestions = input?.rows.map(questionMapper);
    return mappedQuestions.filter((i) => i !== null);
}

export const createQuestion = [
    // VANTAR VALIDATION
    createQuestionHandler,
]

export async function createQuestionHandler(req, res, next) {
    const { title, description } = req.body;
    const { slug } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const questionToCreate = {
        title,
        description: description || '',
        exam_id: exam.id
    };

    const createdQuestion = await insertQuestion(questionToCreate, exam.id);
    if (!createdQuestion) {
        return next(new Error('Unable to create question'));
    }

    return res.json(createdQuestion);
}