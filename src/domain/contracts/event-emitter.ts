export interface EventEmitter<T> {
  emit(payload: T): Promise<void>;
}
