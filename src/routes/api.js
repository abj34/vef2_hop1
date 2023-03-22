import express from 'express';
import { jwtOptions, requireAdmin, tokenOptions } from './passport.js';
import { createUser, findById, findByUsername, updateUser, listUsers } from '../lib/users.js';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger.js';
import { catchErrors } from '../lib/catch-errors.js';


export const router = express.Router();

// Index route
export async function index(req, res) {
    return res.json([
        {
            href: '/departments',
            methods: ['GET', 'POST'],
        },
        {
            href: '/departments/:slug',
            methods: ['GET', 'PATCH', 'DELETE'],
        },
        {
            href: '/departments/:slug/courses',
            methods: ['GET', 'POST'],
        },
        {
            href: '/departments/:slug/courses/:courseId',
            methods: ['GET', 'PATCH', 'DELETE'],
        },
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
  catchErrors(registerRoute)
);

router.post(
  '/users/login',
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
  requireAdmin,
  catchErrors(updateUser)
);

/* router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.get('/categories/:slug', getCategory);
router.patch('/categories/:slug', updateCategory);
router.delete('/categories/:slug', deleteCategory); */

// Question routes
/*
router.get('/categories/:slug/courses', listCourses);
router.post('/categories/:slug/courses', createCourse);
router.get('/categories/:slug/courses/:courseId', getCourse);
router.patch('/categories/:slug/courses/:courseId', updateCourse);
router.delete('/categories/:slug/courses/:courseId', deleteCourse);*/