import express from 'express';
import { router } from './routes/api.js';
import cors from 'cors';


const app = express();

app.use(
    cors({
        origin: '*',
    })
)

app.use(express.json());
app.use(router);

const {
    PORT: port = 3000,
  } = process.env;

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://localhost:${port}/`);
});

app.use((req, res) => {
    res.status(404).json({ error: 'not found' });
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'status' in err && 'body' in err) {
        return res.status(400).json({ error: 'invalid json' });
    }

    console.error('error handling route', err);
    return res.status(500).json({ error: err.message ?? 'Internal server error' });
});
