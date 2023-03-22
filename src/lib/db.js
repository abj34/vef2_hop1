import pg from 'pg';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';

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