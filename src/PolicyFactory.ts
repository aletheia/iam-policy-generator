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
  protected effect?: string;
  protected resources?: string[];
  protected actions?: string[];

  constructor(props?: PolicyFactoryProps) {
    if (props) {
      const {effect, resources, actions} = props;
      this.effect = effect ? effect : Effect.ALLOW;
      this.resources = resources || [];
      this.actions = [];
      if (actions) {
        actions.forEach(action => {
          this.addAction(action);
        });
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
    this.resources.concat(resources);
    return this;
  }

  addAction(action: string) {
    this.actions.push(action);
    return this;
  }

  addActions(actions: string[]) {
    this.actions.concat(actions);
    return this;
  }

  buildPolicy() {
    const {effect, resources, actions} = this;
    return JSON.stringify({effect, resources, actions});
  }
}
