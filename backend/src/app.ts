import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/error';

// Route imports
import authRoutes from './routes/auth';
import assetRoutes from './routes/assets';
import riskRoutes from './routes/risks';
import controlRoutes from './routes/controls';
import controlAssessmentRoutes from './routes/controlAssessments';
import evidenceRoutes from './routes/evidence';
import findingRoutes from './routes/findings';
import remediationRoutes from './routes/remediations';
import complianceRoutes from './routes/compliance';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'GRCTrack API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/controls', controlRoutes);
app.use('/api/control-assessments', controlAssessmentRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/findings', findingRoutes);
app.use('/api/remediations', remediationRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
