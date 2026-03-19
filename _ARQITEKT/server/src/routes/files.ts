import { Router } from 'express';
import {
  listProjectFiles,
  readProjectFile,
  writeProjectFile,
  deleteProjectFile,
  renameProjectFile,
  createProjectDirectory,
} from '../services/fileSystem.js';
import { validate, writeFileSchema, renameFileSchema, deleteFileSchema, createDirSchema } from '../middleware/validation.js';
import { requireRole } from '../middleware/rbac.js';

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
filesRouter.post('/:id/files/write', requireRole('editor'), validate(writeFileSchema), async (req, res, next) => {
  try {
    const { path: filePath, content } = req.body;
    await writeProjectFile(req.params.id as string, filePath, content);
    res.json({ success: true, path: filePath });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/files
filesRouter.delete('/:id/files', requireRole('editor'), validate(deleteFileSchema), async (req, res, next) => {
  try {
    const { path: filePath } = req.body;
    await deleteProjectFile(req.params.id as string, filePath);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id/files/rename
filesRouter.patch('/:id/files/rename', requireRole('editor'), validate(renameFileSchema), async (req, res, next) => {
  try {
    const { oldPath, newPath } = req.body;
    await renameProjectFile(req.params.id as string, oldPath, newPath);
    res.json({ success: true, path: newPath });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/files/mkdir
filesRouter.post('/:id/files/mkdir', requireRole('editor'), validate(createDirSchema), async (req, res, next) => {
  try {
    const { path: dirPath } = req.body;
    await createProjectDirectory(req.params.id as string, dirPath);
    res.json({ success: true, path: dirPath });
  } catch (err) {
    next(err);
  }
});
