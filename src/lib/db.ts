import pg from 'pg';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

dotenv.config();

const { DATABASE_URL: connectionString } = process.env;
const pool = new pg.Pool({ connectionString });

pool.on('error', (err: Error) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

type QueryInput = string | number | null;


/**
 * Nær í tengingu úr pool og framkvæmir query
 * @param q query strengur
 * @param values array af gildum sem eru sett í query strenginn
 * @param silent ef true, þá prentar ekki út villuskilaboð
 * @returns result af query
 */
export async function query(q: string, values: Array<QueryInput> = [], silent = false) {
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