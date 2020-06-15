import {writeFileSync} from 'fs';
import {resolve} from 'path';
import winston, {Logger} from 'winston';
import foreach = require('lodash.foreach');
import camelCase = require('lodash.camelcase');
import toUpper = require('lodash.toupper');
import snakeCase = require('lodash.snakecase');
import capitalize = require('lodash.capitalize');
import replace = require('lodash.replace');
import fetch from 'node-fetch';
import {createHash} from 'crypto';

const POLICY_URL = 'https://awspolicygen.s3.amazonaws.com/js/policies.js';
const POLICY_JSON = resolve(__dirname, '../generated/policies.json');
const FILE_ACTIONS_TS = resolve(__dirname, '../generated/Actions.ts');
const FILE_SERVICES_TS = resolve(__dirname, '../generated/Services.ts');
const FILE_ARN_TEMPLATE_TS = resolve(__dirname, '../generated/ArnTemplates.ts');

interface ServiceName {
  plain: string;
  upperCamelCase: string;
  screamingSnakeCase: string;
}
interface AWSPolicyJson {
  serviceMap: {
    [key in keyof string]: AWSServicePolicy;
  };
}
interface AWSServicePolicy {
  StringPrefix: string;
  Actions: string[];
  ArnFormat: string;
}

export class PolicyGenerator {
  logger: Logger;
  policyJson?: AWSPolicyJson;
  policyVersion?: string;
  policyHash?: string;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async fetchPolicyDescriptor(descriptorUrl: string) {
    this.logger.info(`Fetching IAM policy metadata from ${descriptorUrl} `);
    const response = await fetch(descriptorUrl);
    const policyJs = await response.text();
    const policyJsonString = policyJs.substring(
      'app.PolicyEditorConfig='.length
    );
    const policyJson = JSON.parse(policyJsonString);

    if (policyJson) {
      this.logger.info('Saving policy file.');
      const policyFile = JSON.stringify(policyJson, null, 4);
      writeFileSync(POLICY_JSON, policyFile);

      this.policyJson = policyJson;
      this.policyHash = this.calcPolicyHash(policyJson);
      this.policyVersion = new Date().toISOString();
    } else {
      logger.error('Policy saving error.');
    }
  }

  calcPolicyHash(policyJson: AWSPolicyJson) {
    const policyFileToHAsh = JSON.stringify(policyJson, null, 0);
    const policyHash = createHash('md5').update(policyFileToHAsh).digest('hex');
    return policyHash;
  }

  parseServiceName(serviceName: string): ServiceName {
    const plain = serviceName.replace('Amazon ', '').replace('AWS ', '');
    const upperCamelCase = capitalize(camelCase(plain));
    const screamingSnakeCase = toUpper(
      replace(replace(plain, /-|\(|\)|\./g, ''), / +/g, '_')
    );
    return {plain, upperCamelCase, screamingSnakeCase};
  }

  generateFileHeader() {
    let header = 'export const version = {\n';
    header += `version: '${this.policyVersion}', \n`;
    header += `hash: '${this.policyHash}', \n`;
    header += '} \n\n';
    return header;
  }

  generateContent(
    contentGeneratorLoop: Function,
    contentHeader = '',
    contentFooter = ''
  ) {
    let content = '';
    content += this.generateFileHeader();
    content += contentHeader;

    foreach(
      this.policyJson!.serviceMap,
      (val: AWSServicePolicy, key: string) => {
        const serviceName = this.parseServiceName(key);
        const extractedValue = val;
        content += contentGeneratorLoop(serviceName, extractedValue);
      }
    );

    content += contentFooter;
    return content;
  }

  generateServiceContent() {
    const contentHeader = 'export enum Service {\n';
    const contentGeneratorLoop = (
      serviceName: ServiceName,
      extractedValue: AWSServicePolicy
    ) => {
      return `  ${serviceName.screamingSnakeCase} = '${extractedValue.StringPrefix}',\n`;
    };
    const contentFooter = '}\n';

    return this.generateContent(
      contentGeneratorLoop,
      contentHeader,
      contentFooter
    );
  }

  generateServiceArnContent() {
    const contentHeader = 'export enum ServiceArnTemplates {\n';
    const contentGeneratorLoop = (
      serviceName: ServiceName,
      extractedValue: AWSServicePolicy
    ) => {
      return `  ${serviceName.screamingSnakeCase} = '${extractedValue.ArnFormat}',\n`;
    };
    const contentFooter = '}\n';

    return this.generateContent(
      contentGeneratorLoop,
      contentHeader,
      contentFooter
    );
  }

  generatePolicyActionsContent() {
    const contentGeneratorLoop = (
      serviceName: ServiceName,
      extractedValue: AWSServicePolicy
    ) => {
      let content = `export enum ${serviceName.screamingSnakeCase} {\n`;
      const serviceString = extractedValue.StringPrefix;
      const actionsContent = extractedValue.Actions.map((action: string) => {
        const actionName = toUpper(snakeCase(action));
        return `  ${actionName} = '${serviceString}:${action}'`;
      }).join(',\n');
      content += actionsContent + ',\n}\n';
      return content;
    };

    return this.generateContent(contentGeneratorLoop);
  }

  generateFiles(
    servicesOutFileName: string,
    actionsOutFileName: string,
    arnTemplatesOutFileName: string
  ) {
    logger.info('Generating TS file containing Supported IAM Services enum.');
    const servicesContent = this.generateServiceContent();
    writeFileSync(servicesOutFileName, servicesContent);

    logger.info('Generating TS file containing AWS Service Policies enums.');
    const actionsContent = this.generatePolicyActionsContent();
    writeFileSync(actionsOutFileName, actionsContent);

    logger.info('Generating TS file containing ServiceArn');
    const serviceArnTemplatesContent = this.generateServiceArnContent();
    writeFileSync(arnTemplatesOutFileName, serviceArnTemplatesContent);
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const generator = new PolicyGenerator(logger);
generator
  .fetchPolicyDescriptor(POLICY_URL)
  .then(() => {
    generator.generateFiles(
      FILE_SERVICES_TS,
      FILE_ACTIONS_TS,
      FILE_ARN_TEMPLATE_TS
    );
  })
  .then(() =>
    logger.info('library data built. Please import package and have fun!')
  );
