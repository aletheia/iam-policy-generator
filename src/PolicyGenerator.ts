export class PolicyGenerator {
  effect?: string;
  resources: string[];
  actions: string[];
  protected service: string;

  constructor(
    service: string,
    effect?: string,
    resources?: string[],
    actionAPIs?: string[]
  ) {
    this.service = service;
    this.effect = effect;
    this.resources = resources || [];
    this.actions = [];
    if (actionAPIs) {
      actionAPIs.forEach(action => {
        this.addAction(action);
      });
    }
  }
  addResource(arn: string) {
    this.resources.push(arn);
  }

  addAction(api: string) {
    this.actions.push(`${this.service}:${api}`);
  }
}
