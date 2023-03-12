
import { dropSchema, createSchema, end} from '../lib/db.js';
import dotenv from 'dotenv';

dotenv.config();

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
}

setup().catch((err) => {
    console.error('error running setup', err);
    end();
});