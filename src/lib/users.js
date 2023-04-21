
import { query, conditionalUpdate, insertUserIntoScores } from './db.js';
import xss from 'xss';
import bcrypt from 'bcrypt';

import pkg from 'bcrypt';
const { bcryptRounds } = pkg;

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);

    if (result && result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendnafni');
    return null;
  }

  return false;
}
export async function isAdmin(username) {
  const q = 'SELECT admin FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);

    if (result &&result.rowCount === 1) {
      return !!result.rows[0].admin;
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendnafni');
    return null;
  }

  return false;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result && result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function createUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(bcryptRounds, 10)
  );

  const q = `
    INSERT INTO
      users (username, email, password)
    VALUES
      ($1, $2, $3)
    RETURNING *`;

  const values = [xss(username), xss(email), hashedPassword];
  const result = await query(q, values);

  insertUserIntoScores(result.rows[0].id);

  if(result){
    return result.rows[0];
  }
  else{
    return 'error';
  }
}
function isInt(i) {
  return i !== '' && Number.isInteger(Number(i));
}

// TODO move to utils
function isString(s) {
  return typeof s === 'string';
}

export async function updateUser(id, password, email) {
  if (!isInt(id)) {
    return null;
  }

  const fields = [
    isString(password) ? 'password' : null,
    isString(email) ? 'email' : null,
  ];

  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, parseInt(bcryptRounds, 10));
  }

  const values = [hashedPassword, isString(email) ? xss(email) : null];

  fields.push('updated');
  values.push(new Date());

  const result = await conditionalUpdate('users', id, fields, values);

  if (!result) {
    return null;
  }

  const updatedUser = result.rows[0];
  delete updatedUser.password;

  return updatedUser;
}

export async function listUser(userId) {
  const user = await query(
    `
      SELECT
        id, username, email, admin, created, updated
      FROM
        users
      WHERE
        id = $1
    `,
    [userId]
  );

  if (!user) {
    return null;
  }

  return user;
}

export async function listUsers(req, res) {
  const { offset = 0, limit = 10 } = req.query;

  const users = await query(
    `SELECT
        id, username, email, is_admin, created, updated
      FROM
        users
      ORDER BY id ASC`,
    [],
    { offset, limit }
  );

  if (!users) {
    return null;
  }

  return res.json(users);
}
