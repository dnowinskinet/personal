import { GameEvent, GameEventRecord, createGameEventRecord } from '../game-engine/game-events';

const EVENT_HISTORY_LIMIT = 12;

export class GameEventLog {
  private nextId = 0;
  private history: readonly GameEventRecord[] = [];

  record(event: GameEvent, timestampMs: number): readonly GameEventRecord[] {
    this.nextId += 1;
    const record = createGameEventRecord(this.nextId, event, timestampMs);
    this.history = [record, ...this.history].slice(0, EVENT_HISTORY_LIMIT);
    return this.history;
  }
}
