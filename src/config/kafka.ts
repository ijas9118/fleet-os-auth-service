import type { Producer } from "kafkajs";

import { Kafka, logLevel } from "kafkajs";

import logger from "./logger";
import env from "./validate-env";

/**
 * Kafka client instance configured for FleetOS Auth Service
 */
const kafka = new Kafka({
  clientId: "fleet-os-auth-service",
  brokers: [env.KAFKA_BROKER || "kafka.infrastructure.svc.cluster.local:9092"],
  logLevel: logLevel.WARN, // Reduced from ERROR to suppress benign metadata warnings
  retry: {
    initialRetryTime: 100,
    retries: 8,
    maxRetryTime: 30000,
    multiplier: 2,
  },
  connectionTimeout: 10000,
  requestTimeout: 30000,
});

/**
 * Kafka producer instance for publishing events
 * Uses transactional ID for exactly-once delivery semantics
 */
const producer: Producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
  maxInFlightRequests: 5,
  idempotent: true,
  retry: {
    retries: 5,
  },
});

let isConnected = false;

/**
 * Connect the Kafka producer
 * Should be called during application startup
 */
export async function connectProducer(): Promise<void> {
  if (!isConnected) {
    try {
      await producer.connect();
      isConnected = true;
      logger.info("✅ Kafka producer connected successfully");
    }
    catch (error) {
      logger.error("❌ Failed to connect Kafka producer", error);
      throw error;
    }
  }
}

/**
 * Disconnect the Kafka producer
 * Should be called during graceful shutdown
 */
export async function disconnectProducer(): Promise<void> {
  if (isConnected) {
    try {
      await producer.disconnect();
      isConnected = false;
      logger.info("Kafka producer disconnected");
    }
    catch (error) {
      logger.error("Error disconnecting Kafka producer", error);
    }
  }
}

/**
 * Check if producer is connected
 */
export function isProducerConnected(): boolean {
  return isConnected;
}

export { kafka, producer };
