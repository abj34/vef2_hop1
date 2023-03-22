
import { query, conditionalUpdate } from './db.js';
import xss from 'xss';

import pkg from 'bcrypt';
const { bcrypt, bcryptRounds } = pkg;

export async function comparePasswords(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.error('Gat ekki borið saman lykilorð', e);
  }

  return false;
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

export async function createUser(
  name, 
  username, 
  password) {
  // Geymum hashað password!
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `
    INSERT INTO
      users (name, username, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const result = await query(q, [name, username, hashedPassword]);
    if(result){
    return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki búið til notanda');
  }

  return null;
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
