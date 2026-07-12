import { GameEventLog } from './game-event-log';

describe('GameEventLog', () => {
  it('assigns ordered IDs and retains only the latest twelve semantic events', () => {
    const log = new GameEventLog();
    let history = log.record({ type: 'gameTab.changed', tabId: 'hustles' }, 1);

    for (let index = 2; index <= 14; index += 1) {
      history = log.record({ type: 'gameTab.changed', tabId: 'hustles' }, index);
    }

    expect(history.length).toBe(12);
    expect(history[0].id).toBe(14);
    expect(history[0].timestampMs).toBe(14);
    expect(history[11].id).toBe(3);
  });
});
