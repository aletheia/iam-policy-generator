import {PolicyStatement, Effect as CdkIamEffect} from '@aws-cdk/aws-iam';
import {PolicyGenerator, PolicyGeneratorProps} from './PolicyGenerator';

export class PolicyStatementGenerator extends PolicyGenerator {
  constructor(props: PolicyGeneratorProps) {
    super(props);
  }
  build() {
    const iamEffect: CdkIamEffect =
      CdkIamEffect[this.effect! as keyof typeof CdkIamEffect];
    return new PolicyStatement({
      effect: iamEffect,
      resources: this.resources,
      actions: this.actions,
    });
  }
}
