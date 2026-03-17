import { Router } from 'express';
import { listProjectFiles, readProjectFile, writeProjectFile } from '../services/fileSystem.js';
import { validate, writeFileSchema } from '../middleware/validation.js';

export const filesRouter = Router();

// GET /api/projects/:id/files
filesRouter.get('/:id/files', async (req, res, next) => {
  try {
    const subPath = (req.query.path as string) || '';
    const files = await listProjectFiles(req.params.id as string, subPath);
    res.json(files);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/files/read
filesRouter.get('/:id/files/read', async (req, res, next) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ error: 'path query parameter is required' });
      return;
    }
    const result = await readProjectFile(req.params.id as string, filePath);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/files/write
filesRouter.post('/:id/files/write', validate(writeFileSchema), async (req, res, next) => {
  try {
    const { path: filePath, content } = req.body;
    await writeProjectFile(req.params.id as string, filePath, content);
    res.json({ success: true, path: filePath });
  } catch (err) {
    next(err);
  }
});
