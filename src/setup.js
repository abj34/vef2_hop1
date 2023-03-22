import { readFile } from 'fs/promises';
import { dropSchema, createSchema, query, end} from './lib/db.js';
import dotenv from 'dotenv';

dotenv.config();

const INSERT_FILE = './sql/insert.sql';

async function setup() {
    const drop = await dropSchema();

    if (drop) {
        console.info('schema dropped');
    } else {
        console.info('schema not dropped, exiting');
        end();
        process.exit(-1);
    }

    const result = await createSchema();

    if (result) {
        console.info('schema created');
    } else {
        console.info('schema not created, exiting');
        end();
        return process.exit(-1);
    }
    const data = await readFile(INSERT_FILE);
    const insert = await query(data.toString('utf-8'));
  
    if (insert) {
      console.info('data inserted');
    } else {
      console.info('data not inserted');
    }
}

setup().catch((err) => {
    console.error('error running setup', err);
    end();
});