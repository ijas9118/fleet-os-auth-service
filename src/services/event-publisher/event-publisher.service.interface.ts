/**
 * Domain Event structure
 * All events published to Kafka follow this schema
 */
export interface DomainEvent<T = any> {
  /** Unique identifier for this event instance */
  eventId: string;
  /** Type of event (e.g., 'otp.generated') */
  eventType: string;
  /** ISO 8601 timestamp when event was created */
  timestamp: string;
  /** Event schema version for backward compatibility */
  version: string;
  /** Event-specific payload */
  payload: T;
}

/**
 * Event Publisher Service Interface
 * Publishes domain events to Kafka topics
 */
export interface IEventPublisherService {
  /**
   * Publish a domain event to a Kafka topic
   * @param topic - Kafka topic name
   * @param eventType - Type of event (used for routing/filtering)
   * @param payload - Event-specific data
   * @returns Promise that resolves when event is published (fire-and-forget)
   */
  publish: <T>(topic: string, eventType: string, payload: T) => Promise<void>;
}
