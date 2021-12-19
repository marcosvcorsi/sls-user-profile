import uuid from 'uuid-by-string';

import { Uuid } from '../../domain/contracts/uuid';

export class UuidHandler implements Uuid {
  generate(value: string): string {
    return uuid(value);
  }
}
