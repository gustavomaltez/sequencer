export class Sequencer {
  private _steps: Step[] = [];

  constructor(root: Step) {
    this._steps.push(root);
    this.initialize();
  }

  public initialize() {
    while (isBranch(this.current)) this.navigate('forward');
  }

  private getStepByRule(rule: NavigationRule) {
    const id = resolve(rule);
    if (!id) return undefined; // Means there is no step to navigate to

    const node = isLeaf(this.current) ? this.parent : this.current;
    const result = node.steps?.find(step => step.id === id);
    if (result) return result;

    throw new Error(`Step with id '${id}' not found in '${node.id}'`);
  }

  private navigate(direction: 'backward' | 'forward') {
    if (isLeaf(this.current)) {
      const { previous, next } = this.current;
      const step = this.getStepByRule(direction === 'forward' ? next : previous);
      this._steps.pop();
      if (step) this._steps.push(step);
    }

    while (isBranch(this.current)) {
      if (direction === 'forward') {
        const start = this.getStepByRule(this.current.start);
        if (start) this._steps.push(start);
      } else if (direction === 'backward') {
        this._steps.pop();
      }
    }
  }

  get current(): Step {
    return this._steps[this._steps.length - 1];
  }

  get parent(): Step {
    return this._steps[this._steps.length - 2];
  }

  next() {
    this.navigate('forward');
  }

  previous() {
    this.navigate('backward');
  }
}

// Helper functions ------------------------------------------------------------

function isLeaf(step: Step): step is LeafStep {
  return !step.steps;
}

function isBranch(step: Step): step is BranchStep {
  return !!step.steps;
}

function resolve(rule: NavigationRule): NavigationResult {
  return typeof rule === 'function' ? rule() : rule;
}

// Types -----------------------------------------------------------------------

type NavigationResult = string | undefined;

type NavigationRule = NavigationResult | (() => NavigationResult);

type BasicStep = {
  /** Step Unique Identifier */
  id: string;
  /** Rule to determine the previous step */
  previous?: NavigationRule;
  /** Rule to determine the next step */
  next?: NavigationRule;
};

type LeafStep = BasicStep & { steps?: undefined; start?: undefined };
type BranchStep = BasicStep & {
  /** List of sub steps for this step */
  steps: Step[];
  /** Rule to determine the first step of the sub steps */
  start: NavigationRule;
};

type Step = LeafStep | BranchStep;
