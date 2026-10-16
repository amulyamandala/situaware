import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Scenario } from '../models/Scenario';

const router = Router();

// GET all scenarios
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const scenarios = await Scenario.find().sort({ updatedAt: -1 });
    res.json({ scenarios });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET scenario by ID
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    res.json({ scenario });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create scenario (instructor/admin)
router.post('/', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      version = '1.0.0',
      domains = ['land', 'air', 'cyber', 'ew'],
      durationMinutes = 20,
      roleDefinitions = [],
      eventDefinitions = [],
      disruptionConfiguration = { presets: [] },
      scoringRubric,
      learningObjectives = [],
      status = 'published',
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }

    const scenario = await Scenario.create({
      title,
      description,
      version,
      domains,
      durationMinutes,
      roleDefinitions,
      eventDefinitions,
      disruptionConfiguration,
      scoringRubric: scoringRubric || {
        version: '1.0.0',
        weights: {
          timeliness: 0.20,
          evidenceUse: 0.25,
          confidenceCalibration: 0.20,
          teamCoordination: 0.20,
          objectiveCompletion: 0.15,
        },
        checkpoints: [],
      },
      learningObjectives,
      status,
      createdBy: req.user?.userId,
    });

    res.status(201).json({ scenario });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update scenario
router.patch('/:id', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const scenario = await Scenario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    res.json({ scenario });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE scenario
router.delete('/:id', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const scenario = await Scenario.findByIdAndDelete(req.params.id);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    res.json({ message: 'Scenario deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST duplicate scenario
router.post('/:id/duplicate', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const original = await Scenario.findById(req.params.id);
    if (!original) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }

    const clonedData = original.toObject();
    delete (clonedData as any)._id;
    delete (clonedData as any).createdAt;
    delete (clonedData as any).updatedAt;
    clonedData.title = `${clonedData.title} (Copy)`;
    clonedData.createdBy = req.user?.userId as any;

    const copy = await Scenario.create(clonedData);
    res.status(201).json({ scenario: copy });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST validate scenario
router.post('/:id/validate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }

    const issues: string[] = [];

    // Check weights sum
    const w = scenario.scoringRubric.weights;
    const sum = w.timeliness + w.evidenceUse + w.confidenceCalibration + w.teamCoordination + w.objectiveCompletion;
    if (Math.abs(sum - 1.0) > 0.001) {
      issues.push(`Scoring rubric weights must sum to 1.0 (current sum: ${sum.toFixed(3)})`);
    }

    // Check roles
    if (!scenario.roleDefinitions || scenario.roleDefinitions.length === 0) {
      issues.push('Scenario must define at least one participant role.');
    }

    // Check events
    if (!scenario.eventDefinitions || scenario.eventDefinitions.length === 0) {
      issues.push('Scenario must contain at least one synthetic event definition.');
    }

    // Check domains coverage
    const eventDomains = new Set(scenario.eventDefinitions.map((e) => e.domain));
    for (const d of scenario.domains) {
      if (!eventDomains.has(d)) {
        issues.push(`Domain '${d}' is included in scenario settings but has no defined synthetic events.`);
      }
    }

    const isValid = issues.length === 0;
    res.json({
      isValid,
      issues,
      summary: {
        totalEvents: scenario.eventDefinitions.length,
        totalRoles: scenario.roleDefinitions.length,
        totalCheckpoints: scenario.scoringRubric.checkpoints.length,
        domains: Array.from(eventDomains),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
