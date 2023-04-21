import express from 'express';
import { jwtOptions, requireAdmin, requireUser, tokenOptions } from './passport.js';
import { createUser, findById, findByUsername, updateUser, listUsers } from '../lib/users.js';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger.js';
import { catchErrors } from '../lib/catch-errors.js';
import { 
  listExams, 
  getExam, 
  updateExam, 
  deleteExam, 
  createExam, 
  getExamResults, 
  getScoreboard } from './exams.js';
import { createQuestion, updateQuestion, deleteQuestion } from './questions.js';
import { 
  usernameValidator, 
  emailValidator, 
  passwordValidator, 
  validationCheck, 
  nameValidator,
  descriptionValidator,
  titleValidator,
  answerValidator,
  fakeanswer1Validator,
  fakeanswer2Validator,
  fakeanswer3Validator,
  usernameDoesNotExistValidator,
  usernameAndPasswordValidator  } from '../lib/validation.js';
import { imageHandler } from '../lib/cloudinary.js';


export const router = express.Router();

// Index route
export async function index(req, res) {
    return res.json([
        {
            href: '/exams',
            methods: ['GET', 'POST'],
        },
        {
            href: '/exams/:slug',
            methods: ['GET', 'PATCH', 'DELETE'],
        },
        {
            href: '/exams/:slug/questions',
            methods: ['GET', 'POST'],
        }
    ]);
}
async function registerRoute(req, res) {
    const { username, email, password = '' } = req.body;
  
    const result = await createUser(username, email, password);
  
    delete result.password;
  
    return res.status(201).json(result);
  }
  
  async function loginRoute(req, res) {
    const { username } = req.body;
  
    const user = await findByUsername(username);
  
    if (!user) {
      logger.error('Unable to find user', username);
      return res.status(500).json({});
    }
  
    const payload = { id: user.id };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    delete user.password;
  
    return res.json({
      user,
      token,
      expiresIn: tokenOptions.expiresIn,
    });
  }
  
  async function currentUserRoute(req, res) {
    const { user: { id } = {} } = req;
  
    const user = await findById(id);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    delete user.password;
  
    return res.json(user);
  }
  
  async function updateCurrentUserRoute(req, res) {
    const { id } = req.user;
  
    const user = await findById(id);
  
    if (!user) {
      // shouldn't happen
      logger.error('Unable to update user by id', id);
      return res.status(500).json(null);
    }
  
    const { password, email } = req.body;
  
    const result = await updateUser(id, password, email);
  
    if (!result) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
  
    return res.status(200).json(result);
  }

  function returnResource(req, res) {
    return res.json(req.resource);
  }

// Category routes
router.get('/', index);
router.post(
  '/users/register',
  usernameValidator,
  emailValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  validationCheck,
  catchErrors(registerRoute)
);

router.post(
  '/users/login',
  usernameValidator,
  passwordValidator,
  usernameAndPasswordValidator,
  validationCheck,
  catchErrors(loginRoute)
);

router.get('/users/me', requireAdmin, catchErrors(currentUserRoute));

router.patch(
  '/users/me',
  requireAdmin,
  catchErrors(updateCurrentUserRoute)
);

router.get(
  '/users',
  requireAdmin,
  catchErrors(listUsers)
);

router.get(
  '/users/:id',
  requireAdmin,
  returnResource
);

router.patch(
  '/users/:id',
  usernameValidator,
  emailValidator,
  passwordValidator,
  requireAdmin,
  catchErrors(updateUser)
);

//==========================================
router.get('/exams', listExams);
router.post('/exams',
  nameValidator,
  descriptionValidator,
  validationCheck,
  requireAdmin,
  createExam
  );

router.get('/exams/:slug', getExam);
router.post('/exams/:slug',
  titleValidator,
  descriptionValidator,
  answerValidator,
  fakeanswer1Validator,
  fakeanswer2Validator,
  fakeanswer3Validator,
  validationCheck,
  requireAdmin,
  createQuestion
  );

router.patch('/exams/:slug',
  validationCheck,
  requireAdmin,
  updateExam
  );

router.delete('/exams/:slug',requireAdmin, deleteExam);

router.patch('/exams/:slug/:questionId',
  validationCheck, 
  requireAdmin,
  updateQuestion
  );

router.delete('/exams/:slug/:questionId',requireAdmin, deleteQuestion);


router.post('/exams/:slug/results', requireUser, getExamResults);
router.get('/exams/:slug/scoreboard', getScoreboard);
router.post('/photo', imageHandler);