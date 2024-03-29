import {PolicyStatement, Effect as CdkIamEffect} from '@aws-cdk/aws-iam';
import {PolicyFactory} from './PolicyFactory';

export class PolicyStatementFactory extends PolicyFactory {
	build() {
		if (!this.effect) {
			throw new Error('Effect is required');
		}
		const iamEffect: CdkIamEffect =
			CdkIamEffect[this.effect as keyof typeof CdkIamEffect];
		return new PolicyStatement({
			effect: iamEffect,
			resources: this.resources,
			actions: this.actions,
		});
	}
}
