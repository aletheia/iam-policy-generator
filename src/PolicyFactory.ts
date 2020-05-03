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
  effect: string;
  resources: string[];
  actions: string[];

  constructor(props: PolicyFactoryProps) {
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
  setEffect(effect: Effect) {
    this.effect = effect;
  }

  addResource(arn: string) {
    this.resources.push(arn);
  }

  addAction(action: string) {
    this.actions.push(action);
  }

  buildPolicy() {
    const {effect, resources, actions} = this;
    return JSON.stringify({effect, resources, actions});
  }
}
