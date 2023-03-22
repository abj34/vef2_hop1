import pg from 'pg';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { examMapper, mapDbExamsToExams } from '../routes/exams.js';
import { questionMapper } from '../routes/questions.js';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

dotenv.config();

const { DATABASE_URL: connectionString } = process.env;
const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});



/**
 * Nær í tengingu úr pool og framkvæmir query
 * @param q query strengur
 * @param values array af gildum sem eru sett í query strenginn
 * @param silent ef true, þá prentar ekki út villuskilaboð
 * @returns result af query
 */
export async function query(q, values, silent = false) {
    let client;
    try {
        client = await pool.connect();
    } catch (e) {
        console.error('unable to get client from pool', e);
        return null;
    }

    try {
        const result = await client.query(q, values);
        return result;
    } catch (e) {
        if (!silent) {
            console.error('unable to query', e);
            console.info(q, values);
        }
        return null;
    } finally {
        client.release();
    }
}


/**
 * Býr til gagnagrunn með því að keyra SQL skrá
 * @param schemaFile SQL skrá
 * @returns result af query
 */
export async function createSchema(schemaFile = SCHEMA_FILE) {
    const data = await readFile(schemaFile);
  
    return query(data.toString('utf-8'));
}


/**
 * Eyðir gagnagrunni með því að keyra SQL skrá
 * @param dropFile SQL skrá
 * @returns result af query
 */
export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
    const data = await readFile(dropFile);
  
    return query(data.toString('utf-8'));
}


/**
 * Loka tengingu við gagnagrunn
 */
export async function end() {
    await pool.end();
}

export async function conditionalUpdate(table, id, fields, values) {
    const filteredFields = fields.filter((i) => typeof i === 'string');
    const filteredValues = values.filter(
      (i) => typeof i === 'string' || typeof i === 'number' || i instanceof Date
    );
  
    if (filteredFields.length === 0) {
      return false;
    }
  
    if (filteredFields.length !== filteredValues.length) {
      throw new Error('fields and values must be of equal length');
    }
  
    // id is field = 1
    const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);
  
    const q = `
      UPDATE ${table}
        SET ${updates.join(', ')}
      WHERE
        id = $1
      RETURNING *
      `;
  
    const queryValues = [id].concat(filteredValues);
    const result = await query(q, queryValues);
  
    return result;
}


export async function getExams() {
    const result = await query('SELECT * FROM exams');

    if (!result) { return null; }

    const exams = mapDbExamsToExams(result);
    return exams;
}

export async function insertExam(exam) {
    const q = 'INSERT INTO exams (name, slug, description) VALUES ($1, $2, $3) RETURNING *';

    const values = [exam.name, exam.slug, exam.description];
    const result = await query(q, values);

    return result?.rows[0];

}

export async function getExamBySlug(slug) {
    const result = await query('SELECT * FROM exams WHERE slug = $1', [slug]);

    if (!result) { return null; }

    const exams = examMapper(result.rows[0]);
    return exams;
}

export async function deleteExamBySlug(slug) {
    const result = await query('DELETE FROM exams WHERE slug = $1', [slug]);

    if (!result) { return null; }

    return result.rowCount ===  1;
}

export async function getExamQuestionsById(id) {
    const result = await query('SELECT * FROM questions WHERE exam_id = $1', [id]);

    if (!result) { return null; }

    return result.rows;
}

export async function insertQuestion(question) {
    const q = `INSERT INTO questions (title, question_id, description, exam_id)
               VALUES ($1, $2, $3, $4) RETURNING *`;

    const values = [question.title, question.question_id, question.description, question.exam_id];
    const result = await query(q, values);

    return result?.rows[0];
}

export async function getQuestionByIdAndSlug(id, slug) {
    const result = await query(
        `SELECT * FROM questions WHERE question_id = $1
        AND exam_id = (SELECT id FROM exams WHERE slug = $2)`,
        [id, slug]
    );

    if (!result) { return null; }

    const question = questionMapper(result.rows[0]);
    return question;
}

export async function deleteQuestionByIdAndSlug(id, slug) {
    const result = await query(
        `DELETE FROM questions WHERE question_id = $1
        AND exam_id = (SELECT id FROM exams WHERE slug = $2)`,
        [id, slug]
    );

    if (!result) { return null; }

    return result.rowCount ===  1;
}