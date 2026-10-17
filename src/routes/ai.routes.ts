import { Router, Request, Response, NextFunction } from 'express';
import { explainIssueSchema } from '../schemas';
import { explainIssue } from '../services/ollama.service';

export const aiRouter = Router();

/**
 * POST /api/ai/explain-issue
 * Accepts an open-source issue title and body, then asks the locally running
 * Ollama model for a beginner-friendly explanation and contribution guidance.
 * The response is validated against issueExplanationSchema before it is returned.
 * Model calls stay on the server; the frontend never talks to Ollama directly.
 */
aiRouter.post(
  '/explain-issue',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = explainIssueSchema.parse(req.body);
      const explanation = await explainIssue(input);
      res.status(200).json(explanation);
    } catch (err) {
      next(err);
    }
  },
);
