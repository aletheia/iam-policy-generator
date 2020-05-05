# AWS IAM Policy Generator for AWS CDK

[![npm version](https://badge.fury.io/js/iam-policy-generator.svg)](https://badge.fury.io/js/iam-policy-generator)
[![Build Status](https://travis-ci.com/aletheia/iam-policy-generator.svg?branch=master)](https://travis-ci.com/aletheia/iam-policy-generator)
[![codecov](https://codecov.io/gh/aletheia/iam-policy-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/aletheia/iam-policy-generator)
![David](https://img.shields.io/david/aletheia/iam-policy-generator)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

> A simple NodeJS/Typescript library to generate IAM Policy Actions Statements, depending on selected service.

Remembering IAM policy actions is nearly impossible and sticking to the documentation is time consuming. This library provides a set of predefined constants to be used with any IDE intellisense for autocompletion and a factory class that builds a [AWS CDK PolicyStatement](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-iam.PolicyStatement.html) with ease.

This project goal is to offer simple code handlers, so developers won't have to remember al the complex syntax. This library primary intention is to be used as an helper when writing AWS CDK stack scripts, but it can be used also as a standalone utility in any script.

This library depends on `@aws-cdk/aws-iam` package because it offers a factory named `PolicyStatementFactory` to support direct CDK `PolicyStatement` generation

## Getting Started

Install the library through

### Add package from NPM or Yarn

#### NPM

```bash
npm i iam-policy-generator
```

#### Yarn

```bash
yarn add iam-policy-generator
```

#### Post Install library generation

After **install** phase a local script is run to pull the most updated version of AWS policies and js files are generated to provide support for intellisense.

```bash
info: Fetching IAM policy metadata from https://awspolicygen.s3.amazonaws.com/js/policies.js
info: Saving policy file.
info: Generating TS file containing Supported IAM Services enum.
info: Generating TS file containing AWS Service Policies enums.
info: Generating TS file containing ServiceArn
info: library data built. Please import package and have fun!
```

## Usage

### Import factory and constants into your code

IAM Policy Generator comes with a handy factory class that generates policies after being configured. The package includes also a set of constants to support policy actions autocomplete in any IDE.

#### Javascript

```javascript
const {PolicyStatementFactory, Action} = require('iam-policy-generator');
```

#### Typescript

```typescript
import {PolicyStatementFactory, Action} from 'iam-policy-generator';
```

### Use library in your code

Actions are automatically built into library enum / constants to be used with every editor **autocomplete**.
Just import the `PolicyStatementFactory` and `Action`

#### Constructor properties

The easiest way to use this library is to instantiate a factory object with properties, then call `.build()` method

```javascript
const factory = new PolicyStatementFactory({
  effect: 'Allow' | 'Deny',
  resources: [
    /** an array of resource arns **/
  ],
  actions: [
    /** an array of strings from Action.<SERVICE>.<API> **/
  ],
});

const statement = factory.build();
```

#### Method modifiers

Factory class stores **actions**, **resources** and **effect** in its internal state. So accessors methods are available to add statements components

```javascript
const factory = new PolicyStatementFactory({
  effect: Effect.ALLOW,
  resources: ['*'],
  actions: [Action.S3.PUT_OBJECT, Action.S3.LIST_BUCKET],
});

factory.setEffect('Allow' | 'Deny');

factory.addResource(/** a resource arn **/);
factory.addResources(/** an array of resource arns **/);

factory.addAction(/** an action from Action.<SERVICE>.<API> **/);

factory.addActions([
  /** an array of actions **/
]);

const statement = factory.build();
```

#### Method chaining

Factory methods support chaining, so a cleaner usage would be

```javascript
const statement = new PolicyStatement()
  .setEffect('Allow')
  .addResource(/** a resource arn **/)
  .addResources([
    /** an array of resource arns **/
  ])
  .addAction(/** an action from Action.<SERVICE>.<API> **/)
  .addActions([
    /** an array of actions **/
  ])
  .build();
```

## Examples

Here some examples about how to use this library to configure policies

### Policy allowing Lambda Function to access bucket objects and list buckets

Define a custom policy to enable a lambda function to access objects on S3 and list buckets:

```javascript
import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {PolicyStatementFactory, Action} from 'iam-policy-generator';
import {Bucket} from '@aws-cdk/aws-s3';
import {Effect} from '@aws-cdk/aws-iam';

export class CdkLambdaFunctionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const exampleBucket = new s3.Bucket(this, 'exampleBucket');

    const exampleFunction = new NodejsFunction(this, 'exampleFunction', {
      entry: path.resolve(__dirname, '../lambda/example-function/index.ts'),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
    });

    exampleFunction.addToRolePolicy(
      new PolicyStatementFactory()
        .setEffect(iam.Effect.ALLOW)
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
```

Full example available [here](https://github.com/aletheia/iam-policy-generator/tree/master/examples/cdk-lambda-function)

## License

This IAM Policy Generator library is distributed under the [MIT License](https://opensource.org/licenses/MIT)
