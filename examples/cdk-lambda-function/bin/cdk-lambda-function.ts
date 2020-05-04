#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {CdkLambdaFunctionStack} from '../lib/cdk-lambda-function-stack';

const app = new cdk.App();
new CdkLambdaFunctionStack(app, 'CdkLambdaFunctionStack');
