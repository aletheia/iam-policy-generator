import { PolicyStatement } from '@aws-cdk/aws-iam';
import { PolicyFactory } from './PolicyFactory';
export declare class PolicyStatementFactory extends PolicyFactory {
    build(): PolicyStatement;
}
