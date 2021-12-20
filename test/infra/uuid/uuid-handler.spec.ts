import { mocked } from 'ts-jest/utils';
import uuid from 'uuid-by-string';

import { UuidHandler } from '../../../src/infra/uuid/uuid-handler';

jest.mock('uuid-by-string');

describe('UuidHandler', () => {
  let value: string;

  let sut: UuidHandler;

  beforeAll(() => {
    value = 'any_value';
  });

  beforeEach(() => {
    sut = new UuidHandler();
  });

  it('should call uuid by string with correct value', () => {
    sut.generate(value);

    expect(uuid).toHaveBeenCalledWith(value);
  });

  it('should return uuid generated on success', () => {
    const uuidValue = 'any_uuid';

    mocked(uuid).mockReturnValue(uuidValue);

    const result = sut.generate(value);

    expect(result).toBe(uuidValue);
  });
});
