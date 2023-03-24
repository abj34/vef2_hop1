import { 
    getExamBySlug, 
    insertQuestion, 
    conditionalUpdate, 
    getQuestionByIdAndSlug,
    deleteQuestionByIdAndSlug
} from '../lib/db.js';
import { slugify } from '../lib/slugify.js';

export function questionMapper(question) {
    if (!question ||
        !question.id ||
        !question.title ||
        !question.description ||
        !question.exam_id ||
        !question.question_id
    ) {
        return null
    }

    const theQuestion = {
        id: question.id,
        title: question.title,
        description: question.description || '',
        exam_id: question.exam_id,
        image: question.image || '',
        question_id: question.question_id,
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
];

// Create a new Question
export async function createQuestionHandler(req, res, next) {
    const { 
        title, 
        description, 
        image, 
        answer, 
        fake_answer_1, 
        fake_answer_2,
        fake_answer_3 } = req.body;
    const { slug } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const questionToCreate = {
        title,
        description: description || '',
        exam_id: exam.id,
        image: image || '',
        question_id: slugify(title),
        answer: answer,
        fake_answer_1: fake_answer_1,
        fake_answer_2: fake_answer_2,
        fake_answer_3: fake_answer_3
    };

    const createdQuestion = await insertQuestion(questionToCreate);
    if (!createdQuestion) {
        return next(new Error('Unable to create question'));
    }

    return res.json(createdQuestion);
}

export const updateQuestion = [
    // VANTAR VALIDATION
    updateQuestionHandler,
];

export async function updateQuestionHandler(req, res, next) {
    const { 
        title, 
        description, 
        image, 
        answer, 
        fake_answer_1, 
        fake_answer_2, 
        fake_answer_3 
    } = req.body;
    const { slug, questionId } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const question = await getQuestionByIdAndSlug(questionId, slug);
    if (!question) { return next(); }

    const fields = [
        typeof title === 'string' && title ? 'title' : null,
        typeof title === 'string' && title ? 'question_id' : null,
        typeof description === 'string' && description ? 'description' : null,
        typeof image === 'string' && image ? 'image' : null,
        typeof answer === 'string' && answer ? 'answer' : null,
        typeof fake_answer_1 === 'string' && fake_answer_1 ? 'fake_answer_1' : null,
        typeof fake_answer_2 === 'string' && fake_answer_2 ? 'fake_answer_2' : null,
        typeof fake_answer_3 === 'string' && fake_answer_3 ? 'fake_answer_3' : null,
    ];

    const values = [
        typeof title === 'string' && title ? title : null,
        typeof title === 'string' && title ? slugify(title) : null,
        typeof description === 'string' && description ? description : null,
        typeof image === 'string' && image ? image : null,
        typeof answer === 'string' && answer ? answer : null,
        typeof fake_answer_1 === 'string' && fake_answer_1 ? fake_answer_1 : null,
        typeof fake_answer_2 === 'string' && fake_answer_2 ? fake_answer_2 : null,
        typeof fake_answer_3 === 'string' && fake_answer_3 ? fake_answer_3 : null,
    ];

    const updated = await conditionalUpdate(
        'questions',
        question.id,
        fields,
        values
    );

    if (!updated) {
        return next(new Error('Unable to update question'));
    }

    return res.json(updated.rows[0]);
}

export async function deleteQuestion(req, res, next) {
    const { slug, questionId } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const question = await getQuestionByIdAndSlug(questionId, slug);
    if (!question) { return next(); }

    const deleted = await deleteQuestionByIdAndSlug(questionId, slug);
    if (!deleted) {
        return next(new Error('Unable to delete question'));
    }

    return res.status(204).send();
}