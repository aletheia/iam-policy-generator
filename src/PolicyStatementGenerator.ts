import {PolicyStatement, Effect} from '@aws-cdk/aws-iam';
import {PolicyGenerator} from './PolicyGenerator';

export interface PolicyStatementGeneratorProps {
  service: string;
  effect?: Effect;
  resources?: string[];
  actionApis?: string[];
}

export class PolicyStatementGenerator extends PolicyGenerator {
  constructor(props: PolicyStatementGeneratorProps) {
    super(
      props.service,
      props.effect as string,
      props.resources,
      props.actionApis
    );
  }
  setEffect(effect: Effect) {
    this.effect = effect;
  }
  build() {
    const iamEffect: Effect = Effect[this.effect! as keyof typeof Effect];
    return new PolicyStatement({
      effect: iamEffect,
      resources: this.resources,
      actions: this.actions,
    });
  }
}
