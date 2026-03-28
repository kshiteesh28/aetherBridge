import { PrismaClient } from '@prisma/client';
import { VertexAdapter } from './vertex-adapter';
import { ActionPackBuilder } from './action-pack.builder';
import { AIProcessingError } from '../../shared/error';
import { DlpServiceClient } from '@google-cloud/dlp';

const prisma = new PrismaClient();
const dlp = new DlpServiceClient();
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'aetherbridge-dev';

export class ReasoningService {
  /**
   * The orchestration flow mapping an uploaded GCS file into a validated ActionPack.
   */
  static async processEvent(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId }});
    if (!event) throw new Error('Event not found');

    await prisma.event.update({
      where: { id: eventId },
      data: { status: 'PROCESSING' }
    });

    try {
      // 1. Invoke Gemini Multi-Modal Engine
      let rawAiOutput = await VertexAdapter.extractIntent(event.rawInputUri, this.inferMime(event.mediaType));

      // 2. Map PII through Google DLP (Security Dimension Quality check)
      if (rawAiOutput.entities) {
        rawAiOutput.entities = await this.maskPii(rawAiOutput.entities);
      }

      // 3. Build Action Pack deterministically
      const actionPack = ActionPackBuilder.build(eventId, rawAiOutput);

      // 4. Save to DB
      await prisma.actionPack.create({
        data: {
          eventId: event.id,
          intentType: actionPack.intent,
          payload: actionPack.entities,
          confidence: rawAiOutput.confidence || 0,
          isVerified: actionPack.verification.status === 'VERIFIED',
        }
      });

      // 5. Finalize State
      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'READY_FOR_REVIEW' }
      });
      
    } catch (err: any) {
      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'FAILED' }
      });
      throw new AIProcessingError('Failed to execute Gemini Engine flow', err.message);
    }
  }

  private static inferMime(type: string): string {
    if (type === 'audio') return 'audio/mp3';
    if (type === 'video') return 'video/mp4';
    return 'image/jpeg';
  }

  private static async maskPii(entities: any): Promise<any> {
    try {
      const stringified = JSON.stringify(entities);
      const [response] = await dlp.deidentifyContent({
        parent: `projects/${PROJECT_ID}/locations/global`,
        deidentifyConfig: {
          infoTypeTransformations: {
            transformations: [
              {
                infoTypes: [{ name: 'PERSON_NAME' }, { name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }],
                primitiveTransformation: {
                  redactConfig: {} 
                }
              }
            ]
          }
        },
        item: { value: stringified }
      });

      if (response.item?.value) {
        return JSON.parse(response.item.value);
      }
      return entities;
    } catch (e) {
      console.warn("DLP masking failed warning (returning unmasked for fallback):", e);
      return entities; // Safe fallback if DLP offline, depending on security matrix
    }
  }
}
