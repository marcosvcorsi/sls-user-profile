import AWS from 'aws-sdk';

import { EventEmitter } from '../../domain/contracts/event-emitter';

export class SNSEventEmitter<T> implements EventEmitter<T> {
  private client: AWS.SNS;

  constructor(private readonly topic: string) {
    this.client = new AWS.SNS();
  }

  async emit(payload: T): Promise<void> {
    await this.client
      .publish({
        TopicArn: this.topic,
        Message: JSON.stringify(payload),
      })
      .promise();
  }
}
