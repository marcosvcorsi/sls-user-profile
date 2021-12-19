import { EventEmitter } from '../../../domain/contracts/event-emitter';
import { SNSEventEmitter } from '../../../infra/sns/event-emitter';

export const makeSNSEventEmitter = <T = any>(topic: string): EventEmitter<T> =>
  new SNSEventEmitter<T>(topic);
