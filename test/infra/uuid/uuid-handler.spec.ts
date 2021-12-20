import { mocked } from 'jest-mock';
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

  it('should throw if uuid by string throws', () => {
    const error = new Error('any_eror');

    mocked(uuid).mockImplementationOnce(() => {
      throw error;
    });

    expect(() => sut.generate(value)).toThrow(error);
  });

  it('should return uuid generated on success', () => {
    const uuidValue = 'any_uuid';

    mocked(uuid).mockReturnValue(uuidValue);

    const result = sut.generate(value);

    expect(result).toBe(uuidValue);
  });
});
