import {writeFileSync} from 'fs';
import {resolve} from 'path';
import winston, {Logger} from 'winston';
import foreach = require('lodash.foreach');
import camelCase = require('lodash.camelcase');
import toUpper = require('lodash.toupper');
import snakeCase = require('lodash.snakecase');
import capitalize = require('lodash.capitalize');
import fetch from 'node-fetch';

const POLICY_URL = 'https://awspolicygen.s3.amazonaws.com/js/policies.js';
const POLICY_JSON = resolve(__dirname, '../generated/policies.json');
const POLICY_ENUM_FILE = resolve(__dirname, '../generated/PolicyEnums.ts');
const SERVICES_ENUM_FILE = resolve(__dirname, '../generated/ServiceEnums.ts');

interface AWSServicePolicy {
  StringPrefix: string;
  Actions: string[];
}

const retrievePolicyList = async (logger: Logger) => {
  logger.info(`Fetching IAM policy metadata from ${POLICY_URL} `);
  const response = await fetch(POLICY_URL);
  const policyJs = await response.text();
  const policyJsonString = policyJs.substring('app.PolicyEditorConfig='.length);
  const policyJson = JSON.parse(policyJsonString);

  logger.info('Saving policy file.');
  writeFileSync(POLICY_JSON, JSON.stringify(policyJson, null, 4));

  let serviceEnumString = '';
  serviceEnumString += 'export enum Service {\n';

  let policyEnumString = '';
  foreach(policyJson.serviceMap, (val: AWSServicePolicy, key: string) => {
    const service = capitalize(
      camelCase(key.replace('Amazon ', '').replace('AWS ', ''))
    );

    const serviceString = val.StringPrefix;
    serviceEnumString += `  ${service} = '${serviceString}',\n`;

    policyEnumString += `export enum ${service} {\n`;
    const res = val.Actions.map((action: string) => {
      const actionName = toUpper(snakeCase(action));
      return `  ${actionName} = '${action}'`;
    }).join(',\n');
    policyEnumString += res + '\n';
    policyEnumString += '}\n\n';
  });
  serviceEnumString += '}\n';
  logger.info('Generating TS file containing Supported IAM Services enum.');
  writeFileSync(SERVICES_ENUM_FILE, serviceEnumString);

  logger.info('Generating TS file containing AWS Service Policies enums.');
  writeFileSync(POLICY_ENUM_FILE, policyEnumString);
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
logger.info('Wellcome to IAM Policy Generator');
retrievePolicyList(logger).then(() =>
  console.log('library data built. Please import package and have fun!')
);
