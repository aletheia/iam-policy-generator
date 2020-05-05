import * as Action from './generated/Actions';

export enum Effect {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export interface PolicyFactoryProps {
  effect?: Effect | string;
  resources?: string[];
  actions?: string[];
}

export class PolicyFactory {
  protected effect: string;
  protected resources: string[];
  protected actions: string[];

  constructor(props?: PolicyFactoryProps) {
    this.effect = Effect.ALLOW;
    this.resources = [];
    this.actions = [];
    if (props) {
      const {effect, resources, actions} = props;
      this.effect = effect ? effect : this.effect;
      this.resources = resources ? resources : this.resources;
      if (actions) {
        this.addActions(actions);
      }
    }
  }

  setEffect(effect: Effect) {
    this.effect = effect;
    return this;
  }

  addResource(arn: string) {
    this.resources.push(arn);
    return this;
  }

  addResources(resources: string[]) {
    resources.forEach(resource => {
      this.addResource(resource);
    });
    return this;
  }

  private isValidAction(action: string) {
    return Object.values(Action).find(service => {
      return Object.values(service).find(a => a === action);
    });
  }

  addAction(action: string) {
    if (this.isValidAction(action)) {
      return this.addActionRaw(action);
    }
    throw new Error(
      `Invalid action: "${action}".` +
        'If you need to include a wildcard, please use factory.addActionRaw(action).'
    );
  }

  addActionRaw(action: string) {
    this.actions.push(action);
    return this;
  }

  addActions(actions: string[]) {
    actions.forEach(action => this.addAction(action));
    return this;
  }

  buildPolicy() {
    const {effect, resources, actions} = this;
    return JSON.stringify({effect, resources, actions});
  }
}
