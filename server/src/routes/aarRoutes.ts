import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Session } from '../models/Session';
import { AARReport } from '../models/AARReport';
import { PdfService } from '../services/pdfService';
import { CsvService } from '../services/csvService';

const router = Router();

// GET AAR summary & details
router.get('/:sessionId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate('scenarioId')
      .populate('createdBy', 'name email');

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const report = await AARReport.findOne({ sessionId: req.params.sessionId }).sort({ createdAt: -1 });

    res.json({
      session,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate or register AAR report
router.post('/:sessionId/generate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const report = await AARReport.create({
      sessionId: session._id,
      generatedBy: req.user?.userId,
      format: 'both',
      generatedAt: new Date(),
      status: 'ready',
      summary: {
        sessionCode: session.sessionCode,
        exerciseDurationSec: session.currentSimulatedTimeSec,
        disruptionsCount: session.activeDisruptions.length,
      },
    });

    res.status(201).json({ message: 'AAR Report generated successfully', report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET download PDF report
router.get('/:sessionId/download-pdf', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const pdfBuffer = await PdfService.generateAARReport(sessionId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SITU-AWARE-AAR-${session.sessionCode}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET download CSV report
router.get('/:sessionId/download-csv', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const csvData = await CsvService.generateSessionCSV(sessionId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SITU-AWARE-AUDIT-${session.sessionCode}.csv"`
    );
    res.send(csvData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
