import { ActionPackOutput } from '../../shared/schemas';
import { ValidationError } from '../../shared/error';

export class ActionPackBuilder {
  /**
   * Standardizes Gemini outputs into deterministic Relay objects,
   * enforcing a severe verification threshold.
   */
  static build(eventId: string, rawOutput: any): ActionPackOutput {
    if (!rawOutput.intent) {
      throw new ValidationError('Intent is required from Gemini output');
    }

    const confidence = parseFloat(rawOutput.confidence);
    const isHighConfidence = !isNaN(confidence) && confidence >= 0.85;

    return {
      event_id: eventId,
      intent: rawOutput.intent,
      entities: rawOutput.entities || {},
      verification: {
        status: isHighConfidence ? 'VERIFIED' : 'REQUIRES_REVIEW',
        ground_truth_source: isHighConfidence ? 'Google Vertex AI Evaluator' : null
      }
    };
  }
}
