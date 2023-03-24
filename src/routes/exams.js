import { slugify } from '../lib/slugify.js';
//import { Request, Response, NextFunction } from 'express';
import { 
    getExams,
    getExamBySlug,
    deleteExamBySlug, 
    conditionalUpdate, 
    insertExam,
    getExamQuestionsById,
    getCorrectAnswerToQuestion,
    getScoreboardFromExamId,
    insertUserIntoScores,
    createScoreColumnbyExamId,
    getHighScoreForUser
} from '../lib/db.js';

export const scores = { currentScore: 0, highestScore: 0 };

/**
 * Mappar niðurstöður úr gagnagrunni í exam object
 * @param {*} exam Output frá gagngagrunni
 * @returns Exam object
 */
export function examMapper(exam) {
    
    if (!exam ||
        !exam.id ||
        !exam.name ||
        !exam.slug ||
        !exam.description ||
        !exam.image
    ) {
        return null;
    }

    const theExam = {
        id: exam.id,
        name: exam.name,
        slug: slugify(exam.name),
        description: exam.description,
        image: exam.image,
    };

    return theExam;
}


/**
 * Mappar mörgum database niðurstöðum í exam objects
 * @param {*} input Output frá gagngagrunni
 * @returns Listi af exam objects
 */
export function mapDbExamsToExams(input) {
    if (!input) { return []; }

    const mappedExams = input?.rows.map(examMapper);
    return mappedExams.filter((i) => i !== null);
}


/**
 * "GET /exams" - Sækir öll exams
 * @returns JSON object af öllum exams
 */
export async function listExams(req, res, next) {
    const exams = await getExams();
    if (!exams) {
        return next(new Error('Unable to get exams'));
    }

    return res.json(exams);
}


/**
 * "POST /exams" - Býr til nýtt exam
 */
export const createExam = [
    // VANTAR VALIDATION
    createExamHandler,
];


/**
 * Býr til nýtt exam með validated gögnum
 * @returns Nýja exam
 */
export async function createExamHandler(req, res, next) {
    const { name, description, image } = req.body;

    const examToCreate = {
        name,
        slug: slugify(name),
        description,
        image
    };

    const createdExam = await insertExam(examToCreate);
    if (!createdExam) {
        return next(new Error('Unable to create exam'));
    }

    createScoreColumnbyExamId(createdExam.id);

    return res.json(createdExam);
}


/**
 * "GET /exams/:slug" - Sækir exam spurningar með id
 * @returns JSON object af exam
 */
export async function getExam(req, res, next) {
    const { slug } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }
    const questions = await getExamQuestionsById(exam.id);
    if (!questions) { return next(); }

    //return res.json(exam);
    return res.json(questions);
}


/**
 * "PATCH /exams/:slug" - Uppfærir exam með slug
 */
export const updateExam = [
    // VANTAR VALIDATION
    updateExamHandler,
];


/**
 * Uppfærir exam með validated gögnum
 * @returns Uppfærða exam
 */
export async function updateExamHandler(req, res, next) {
    const { slug } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const { name, description, image } = req.body;

    const fields = [
        typeof name === 'string' && name ? 'name' : null,
        typeof name === 'string' && name ? 'slug' : null,
        typeof description === 'string' && description ? 'description' : null,
        typeof image === 'string' && image ? 'image' : null,
    ];

    const values = [
        typeof name === 'string' && name ? name : null,
        typeof name === 'string' && name ? slugify(name) : null,
        typeof description === 'string' && description ? description : null,
        typeof image === 'string' && image ? image : null,
    ];

    const updated = await conditionalUpdate(
        'exams',
        exam.id,
        fields,
        values
    );

    if (!updated) {
        return next(new Error('Unable to update exam'));
    }

    return res.json(updated.rows[0]);
}


/**
 * "DELETE /exams/:slug" - Eyðir exam með slug
 * @returns 204 ef eytt
 */
export async function deleteExam(req, res, next) {
    const { slug } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const deleted = await deleteExamBySlug(slug);
    if (!deleted) {
        return next(new Error('Unable to delete exam'));
    }

    return res.status(204).send();
}


export async function getExamResults(req, res, next) {
    const { slug } = req.params;
    const guesses = req.body;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    for (const guess of guesses) {

        const result = await getCorrectAnswerToQuestion(slug, guess.guess_id, guess.guess);

        if (result) {
            scores.currentScore += 1;
        }

    }

    const finalScore = scores.currentScore;
    scores.currentScore = 0;
    if (req.user) {
        const username = req.user.username;
    
        // Save user's score to database
    
        saveScore(username, finalScore);
    
        return res.json({ username, finalScore });
      } else {
    
        return res.json({ finalScore, message: 'Log in to save score' });
      }

    // FIX THE UPDATER WITH ADDING USER
    /*
    const highscore = await getHighScoreForUser(exam.id, user.id);

    if (finalScore > highscore.highscore) {
        // UpdateHandler eða sér scores update?
    }

    
    */

}
function saveScore(username, score) {
    // Save score to database here
  }

export async function getScoreboard(req, res, next) {
    const { slug } = req.params;
    
    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const result = await getScoreboardFromExamId(exam.id);

    if (!result) {
        return next(new Error('Unable to get scoreboard'));
    }

    return res.json(result);
}



/// ADD TO OTHER FUNCTIONS

// TODO: Taka á móti user_id
export async function highscoreReceiver(req, res, next) {
    const { slug } = req.params;

    const exam = await getExamBySlug(slug);
    if (!exam) { return next(); }

    const result = await getHighScoreForUser(exam.id, 1);

    if (!result) {
        return next(new Error('Unable to get highscore'));
    }

    return res.json(result);
}