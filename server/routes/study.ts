import { Request, Response, Router } from 'express';

interface Assessment {
  caseId: string;
  readerId: string;
  fetalAnomalyDetected: boolean;
  notes: string;
}

interface Case {
  id: string;
  securePath: string;
  phiData: Record<string, any>;
  status: 'pending' | 'completed' | 'adjudication';
}

// Global In-Memory Database instances
const casesDb: Case[] = [];
const assessmentsDb: Assessment[] = [];

export const studyRouter = Router();

/**
 * GET /api/studies/next-case/:readerId
 */
studyRouter.get('/next-case/:readerId', (req: Request, res: Response) => {
  const { readerId } = req.params;

  const unassessedCases = casesDb.filter(
    (c) => !assessmentsDb.some((a) => a.caseId === c.id && a.readerId === readerId) && c.status !== 'adjudication'
  );

  if (unassessedCases.length === 0) {
    return res.status(204).json({ message: 'Study fully completed by this reader.' });
  }

  const randomIndex = Math.floor(Math.random() * unassessedCases.length);
  const targetCase = unassessedCases[randomIndex];

  const blindedCase = {
    caseId: targetCase.id,
    scanUrl: `/api/scans/stream/${targetCase.id}`, 
  };

  return res.status(200).json(blindedCase);
});

/**
 * POST /api/studies/assessment
 */
studyRouter.post('/assessment', (req: Request, res: Response) => {
  const { caseId, readerId, fetalAnomalyDetected, notes } = req.body;

  if (!caseId || readerId === undefined || fetalAnomalyDetected === undefined) {
    return res.status(400).json({ error: 'Missing diagnostic metadata attributes.' });
  }

  const newAssessment: Assessment = { caseId, readerId, fetalAnomalyDetected, notes: notes || '' };
  assessmentsDb.push(newAssessment);

  const historicalAssessments = assessmentsDb.filter((a) => a.caseId === caseId);

  if (historicalAssessments.length >= 2) {
    const findings = historicalAssessments.map((a) => a.fetalAnomalyDetected);
    const consensusReached = findings.every((val) => val === findings[0]);

    const targetCase = casesDb.find((c) => c.id === caseId);
    if (targetCase) {
      if (!consensusReached) {
        targetCase.status = 'adjudication';
        return res.status(201).json({ message: 'Conflict detected: moved to Adjudication.', status: 'adjudication' });
      } else {
        targetCase.status = 'completed';
      }
    }
  }

  return res.status(201).json({ message: 'Assessment recorded successfully.', status: 'completed' });
});