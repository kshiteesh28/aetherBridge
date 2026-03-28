import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const storage = new Storage();
const prisma = new PrismaClient();

const BUCKET_NAME = process.env.GCS_INTAKE_BUCKET || 'aetherbridge-intake-dev';

export class IntakeService {
  /**
   * Generates a signed URL to upload media securely to GCS
   * and creates a PENDING event record in the database.
   */
  static async requestUploadUrl(userId: string, mediaType: 'audio'|'video'|'photo'): Promise<{ eventId: string; uploadUrl: string }> {
    const eventId = uuidv4();
    const fileName = `${userId}/${eventId}-${Date.now()}`;
    const file = storage.bucket(BUCKET_NAME).file(fileName);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'application/octet-stream', // Can be refined based on mediaType
    });

    const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;

    await prisma.event.create({
      data: {
        id: eventId,
        userId,
        mediaType,
        rawInputUri: gcsUri,
        status: 'PENDING',
      }
    });

    return { eventId, uploadUrl };
  }

  static async getEventStatus(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        actionPacks: true,
      }
    });
    
    return event;
  }
}
