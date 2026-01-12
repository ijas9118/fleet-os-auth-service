import type { Producer } from "kafkajs";

import { inject, injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";

import logger from "@/config/logger";
import TYPES from "@/di/types";

import type { DomainEvent, IEventPublisherService } from "./event-publisher.service.interface";

/**
 * Event Publisher Service
 * Publishes domain events to Kafka topics with fire-and-forget semantics
 *
 * Note: Event publishing failures are logged but don't throw errors
 * to prevent blocking the main business operations
 */
@injectable()
export class EventPublisherService implements IEventPublisherService {
  constructor(@inject(TYPES.KafkaProducer) private _producer: Producer) {}

  /**
   * Publish a domain event to Kafka
   * Uses fire-and-forget pattern - failures are logged but don't block operations
   */
  async publish<T>(topic: string, eventType: string, payload: T): Promise<void> {
    const event: DomainEvent<T> = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      version: "1.0",
      payload,
    };

    try {
      await this._producer.send({
        topic,
        messages: [
          {
            key: event.eventId,
            value: JSON.stringify(event),
            headers: {
              "event-type": eventType,
              "event-version": "1.0",
              "event-id": event.eventId,
              "timestamp": event.timestamp,
            },
          },
        ],
      });

      logger.info(`📤 Event published: ${eventType}`, {
        eventId: event.eventId,
        topic,
      });
    }
    catch (error) {
      // Log error but don't throw - we don't want to fail the main operation
      logger.error(`❌ Failed to publish event: ${eventType}`, {
        error,
        eventId: event.eventId,
        topic,
      });
      // In production, you might want to:
      // 1. Store in a dead letter queue
      // 2. Implement retry logic
      // 3. Send alerts for monitoring
    }
  }
}
