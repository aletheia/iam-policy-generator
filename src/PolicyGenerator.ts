export enum Effect {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export interface PolicyGeneratorProps {
  service: string;
  effect?: Effect | string;
  resources?: string[];
  actions?: string[];
}

export class PolicyGenerator {
  effect: string;
  resources: string[];
  actions: string[];
  protected service: string;

  constructor(props: PolicyGeneratorProps) {
    const {service, effect, resources, actions} = props;
    this.service = service;
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
