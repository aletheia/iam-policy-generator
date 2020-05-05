import {resolve} from 'path';
import * as cdk from '@aws-cdk/core';
import {Runtime} from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';

import {PolicyStatementFactory, Action} from 'iam-policy-generator';
import {Bucket} from '@aws-cdk/aws-s3';
import {Effect} from '@aws-cdk/aws-iam';

export class CdkLambdaFunctionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const exampleBucket = new Bucket(this, 'exampleBucket', {
      bucketName: 'aws-iam-example-bucket',
    });

    const exampleFunction = new NodejsFunction(this, 'exampleFunction', {
      entry: resolve(__dirname, '../lambda/example-function/index.ts'),
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
    });

    exampleFunction.addToRolePolicy(
      new PolicyStatementFactory()
        .setEffect(Effect.ALLOW)
        .addResource(exampleBucket.bucketArn)
        .addActions([
          Action.S3.LIST_BUCKET,
          Action.S3.PUT_OBJECT,
          Action.S3.GET_OBJECT,
        ])
        .build()
    );
  }
}
