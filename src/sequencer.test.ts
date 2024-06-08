import { assertEquals } from 'testing/asserts';
import { Sequencer } from './sequencer.ts';

Deno.test('Should initialize without errors', () => {
  new Sequencer({
    id: 'a',
    start: 'a',
    steps: [
      {
        id: 'a',
        start: 'a',
        steps: [{ id: 'a' }, { id: 'b' }],
      },
    ],
  });
});

Deno.test('Should navigate to the correct step when initialized', () => {
  const sequencer = new Sequencer({
    id: 'root',
    start: 'node',
    steps: [
      {
        id: 'node',
        start: 'leaf-a',
        steps: [{ id: 'leaf-a' }, { id: 'leaf-b' }],
      },
    ],
  });

  assertEquals(sequencer.current.id, 'leaf-a');
});

Deno.test('Should navigate to the correct next step', () => {
  const sequencer = new Sequencer({
    id: 'root',
    start: 'node',
    steps: [
      {
        id: 'node',
        start: 'leaf-a',
        steps: [
          { id: 'leaf-a', next: 'leaf-b' },
          { id: 'leaf-b', previous: 'leaf-a' },
        ],
      },
    ],
  });

  sequencer.next();
  assertEquals(sequencer.current.id, 'leaf-b');
});

Deno.test('Should navigate to the correct previous step', () => {
  const sequencer = new Sequencer({
    id: 'root',
    start: 'node',
    steps: [
      {
        id: 'node',
        start: 'leaf-a',
        steps: [
          { id: 'leaf-a', next: 'leaf-b' },
          { id: 'leaf-b', previous: 'leaf-a' },
        ],
      },
    ],
  });

  sequencer.next();
  sequencer.previous();
  assertEquals(sequencer.current.id, 'leaf-a');
});
