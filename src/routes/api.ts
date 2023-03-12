import express, { Request, Response } from 'express';

export const router = express.Router();

// Index route
export async function index(req: Request, res: Response) {
    return res.json(/*[
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
    ]*/);
}

// Category routes
router.get('/', index);
router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.get('/categories/:slug', getCategory);
router.patch('/categories/:slug', updateCategory);
router.delete('/categories/:slug', deleteCategory);

// Question routes
/*
router.get('/categories/:slug/courses', listCourses);
router.post('/categories/:slug/courses', createCourse);
router.get('/categories/:slug/courses/:courseId', getCourse);
router.patch('/categories/:slug/courses/:courseId', updateCourse);
router.delete('/categories/:slug/courses/:courseId', deleteCourse);*/