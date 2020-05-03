export enum Effect {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export interface PolicyGeneratorProps {
  service: string;
  effect?: Effect | string;
  resources?: string[];
  actionApis?: string[];
}

export class PolicyGenerator {
  effect: string;
  resources: string[];
  actions: string[];
  protected service: string;

  constructor(props: PolicyGeneratorProps) {
    const {service, effect, resources, actionApis} = props;
    this.service = service;
    this.effect = effect ? effect : Effect.ALLOW;
    this.resources = resources || [];
    this.actions = [];
    if (actionApis) {
      actionApis.forEach(action => {
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

  addAction(api: string) {
    this.actions.push(`${this.service}:${api}`);
  }
}
