# AWS IAM Policy Generator

> A simple NodeJS/Typescript library to generate IAM Policy Actions Statements, depending on selected service.

This project goal is to offer simple code handlers, so developers won't have to remember al the complex syntax. This library primary intention is to be used as an helper when writing AWS CDK stack scripts, but it can be used also as a standalone utility in any script.

Actually it depends on ``@aws-cdk/aws-iam` package because it offers the

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

### Use PolicyGenerator and helpers in your code

Import the package in your source file and instantiate a new **PolicyGenerator** class and API and Service which can be used as _enums_ (typescript) or _constants_ (javascript)

```javascript
const {PolicyGenerator, API, Service} = require('iam-policy-generator');

// your code here

const generator = new PolicyGenerator(Service.S3);
generator.addAction(API.S3.LIST_BUCKET);
generator.addAction(API.S3.PUT_OBJECT);
```

### Use a custom PolicyStatement generator in your CDK code

```javascript
// other CDK imports

const {
  PolicyStatementGenerator,
  API,
  Service,
} = require('iam-policy-generator');

// your code here

clientListFunction.addToRolePolicy(
  new PolicyStatementGenerator({
    service: Service.S3,
    effect: Effect.ALLOW,
    resources: ['*'],
    actionApis: [API.S3.PUT_OBJECT, API.S3.LIST_BUCKET],
  }).build()
);
```

## License

This IAM Policy Generator library is distributed under the [MIT License](https://opensource.org/licenses/MIT)
