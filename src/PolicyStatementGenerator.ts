import {PolicyStatement, Effect as CdkIamEffect} from '@aws-cdk/aws-iam';
import {PolicyGenerator, PolicyGeneratorProps} from './PolicyGenerator';

export class PolicyStatementGenerator extends PolicyGenerator {
  buildPolicyStatement() {
    const iamEffect: CdkIamEffect =
      CdkIamEffect[this.effect! as keyof typeof CdkIamEffect];
    return new PolicyStatement({
      effect: iamEffect,
      resources: this.resources,
      actions: this.actions,
    });
  }
}
