import { assertEquals, assertThrows } from 'testing/asserts';
import { Sequencer } from './sequencer.ts';

Deno.test('Initialization', async ({ step }) => {
  await step("Should resolve the 'start' navigation rule when it is a string", () => {
    const sequencer = new Sequencer({
      id: 'root',
      start: 'node',
      steps: [{ id: 'node' }],
    });
    assertEquals(sequencer.current.id, 'node');
  });

  await step("Should resolve the 'start' navigation rule when it is a function", () => {
    const sequencer = new Sequencer({
      id: 'root',
      start: () => 'node',
      steps: [{ id: 'node' }],
    });
    assertEquals(sequencer.current.id, 'node');
  });

  await step(
    'Should navigate to the correct first step when the sequencer has no sub steps',
    () => {
      const sequencer = new Sequencer({ id: 'root' });
      assertEquals(sequencer.current.id, 'root');
    }
  );

  await step(
    'Should navigate to the correct first step when the sequencer has one sub step with no sub steps',
    () => {
      const sequencer = new Sequencer({
        id: 'root',
        start: 'node',
        steps: [{ id: 'node' }],
      });
      assertEquals(sequencer.current.id, 'node');
    }
  );

  await step(
    'Should navigate to the correct first step when the sequencer has one sub step with one sub step',
    () => {
      const sequencer = new Sequencer({
        id: 'root',
        start: 'node',
        steps: [
          {
            id: 'node',
            start: 'leaf',
            steps: [{ id: 'leaf' }],
          },
        ],
      });
      assertEquals(sequencer.current.id, 'leaf');
    }
  );

  await step(
    'Should navigate to the correct first step when the sequencer has one sub step with more than one sub step',
    () => {
      const sequencer = new Sequencer({
        id: 'root',
        start: 'node',
        steps: [
          {
            id: 'node',
            start: 'leaf-c',
            steps: [{ id: 'leaf-a' }, { id: 'leaf-b' }, { id: 'leaf-c' }],
          },
        ],
      });
      assertEquals(sequencer.current.id, 'leaf-c');
    }
  );
});

Deno.test("'goTo(path)' method", async ({ step }) => {
  await step('Should navigate to the correct provided path', () => {
    const sequencer = new Sequencer({
      id: 'root',
      start: 'node-a',
      steps: [
        {
          id: 'node-a',
          start: 'foo',
          steps: [{ id: 'foo' }, { id: 'bar' }, { id: 'baz' }],
        },
        {
          id: 'node-b',
          start: 'leaf-a',
          steps: [{ id: 'leaf-a' }, { id: 'leaf-b' }, { id: 'leaf-c' }],
        },
      ],
    });

    sequencer.goTo(['node-b', 'leaf-b']);
    assertEquals(sequencer.current.id, 'leaf-b');
  });

  await step('Should throw an error when the provided path is invalid', () => {
    const sequencer = new Sequencer({
      id: 'root',
      start: 'node-a',
      steps: [
        {
          id: 'node-a',
          start: 'foo',
          steps: [{ id: 'foo' }, { id: 'bar' }, { id: 'baz' }],
        },
        {
          id: 'node-b',
          start: 'leaf-a',
          steps: [{ id: 'leaf-a' }, { id: 'leaf-b' }, { id: 'leaf-c' }],
        },
      ],
    });

    assertThrows(() => sequencer.goTo(['node-b', 'leaf-d']));
  });
});

Deno.test('Navigation Forward', async ({ step }) => {
  await step('Should navigate to the next step when within a sub step flow', () => {
    const sequencer = new Sequencer({
      id: 'root',
      start: 'node-a',
      steps: [
        {
          id: 'node-a',
          start: 'leaf-a',
          steps: [
            { id: 'leaf-a', next: 'leaf-b' },
            { id: 'leaf-b', previous: 'leaf-a', next: 'leaf-c' },
            { id: 'leaf-c', previous: 'leaf-b' },
          ],
        },
      ],
    });

    sequencer.next();
    assertEquals(sequencer.current.id, 'leaf-b');
  });
});
