import * as path from 'path';
import {PolicyStatementFactory, Action} from '../index';
import * as cdk from '@aws-cdk/core';
import {Effect} from '@aws-cdk/aws-iam';
import {Runtime} from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Bucket} from '@aws-cdk/aws-s3';

test('README example should work =)', () => {
  class CdkLambdaFunctionStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      const exampleBucket = new Bucket(this, 'exampleBucket');

      const exampleFunction = new NodejsFunction(this, 'exampleFunction', {
        entry: path.resolve(__dirname, '../lambda/example-function/index.ts'),
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
      });

      exampleFunction.addToRolePolicy(
        new PolicyStatementFactory()
          .setEffect(Effect.ALLOW)
          .addResource(exampleBucket.bucketArn)
          .addActions([Action.S3.LIST_BUCKET, Action.S3.PUT_OBJECT])
          .build()
      );
    }
  }

  const app = new cdk.App();
  new CdkLambdaFunctionStack(app, 'CdkLambdaFunctionStack');
});
