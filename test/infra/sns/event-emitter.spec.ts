import { SNS } from 'aws-sdk';
import { mocked } from 'jest-mock';

import { SNSEventEmitter } from '../../../src/infra/sns/event-emitter';

jest.mock('aws-sdk');

describe('SNSEventEmitter', () => {
  let topic: string;
  let payload: any;

  let publishSpy: jest.Mock;
  let publishPromiseSpy: jest.Mock;

  let sut: SNSEventEmitter<any>;

  beforeAll(() => {
    topic = 'any_topic';

    publishPromiseSpy = jest.fn();
    publishSpy = jest.fn().mockReturnValue({
      promise: publishPromiseSpy,
    });

    mocked(SNS).mockImplementation(
      jest.fn().mockImplementation(() => ({
        publish: publishSpy,
      })),
    );
  });

  beforeEach(() => {
    payload = {
      any: 'value',
    };

    sut = new SNSEventEmitter(topic);
  });

  it('should call AWS SNS publish with correct values', async () => {
    await sut.emit(payload);

    expect(publishSpy).toHaveBeenCalledWith({
      TopicArn: topic,
      Message: JSON.stringify(payload),
    });
    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishPromiseSpy).toHaveBeenCalledTimes(1);
  });

  it('should throw if AWS SNS publish promise throws', async () => {
    publishPromiseSpy.mockRejectedValueOnce(new Error('any_error'));

    await expect(sut.emit(payload)).rejects.toThrow();
  });
});
