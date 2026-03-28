import { Router, Request, Response, NextFunction } from 'express';
import { IntakeService } from '../../domains/intake/intake.service';
import { IntakeMetadataSchema } from '../../shared/schemas';
import { NotFoundError, ValidationError, AuthorizationError } from '../../shared/error';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Assuming credentials are in env or default service account for GCP)
if (!admin.apps.length) {
  admin.initializeApp();
}

const router = Router();

// Middleware to verify Firebase Auth Token and inject userId
export const authenticateFirebase = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    throw new AuthorizationError('Missing authentication token');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    throw new AuthorizationError('Invalid authentication token');
  }
};

router.post('/intake', authenticateFirebase, async (req: Request, res: Response) => {
  const parsed = IntakeMetadataSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError('Invalid Intake Metadata', parsed.error.issues);
  }

  const userId = (req as any).user.uid;
  const { uploadUrl, eventId } = await IntakeService.requestUploadUrl(userId, parsed.data.type as any);

  res.status(202).json({
    event_id: eventId,
    status: 'PENDING',
    upload_url: uploadUrl, // The client uses this to upload to GCS directly
    tracking_url: `/api/v1/event/${eventId}`
  });
});

router.get('/event/:id', authenticateFirebase, async (req: Request, res: Response) => {
  const eventId = req.params.id as string;
  const event = await IntakeService.getEventStatus(eventId);
  
  if (!event) {
    throw new NotFoundError('Event does not exist');
  }

  const userId = (req as any).user.uid;
  if (event.userId !== userId) {
    throw new AuthorizationError('Not authorized to view this event');
  }

  res.status(200).json({
    id: event.id,
    status: event.status,
    action_packs: event.actionPacks.map((ap: any) => ({
      id: ap.id,
      intent: ap.intentType,
      payload: ap.payload,
      is_verified: ap.isVerified
    }))
  });
});

export default router;
