"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const winston_1 = __importDefault(require("winston"));
const foreach = require("lodash.foreach");
const camelCase = require("lodash.camelcase");
const toUpper = require("lodash.toupper");
const snakeCase = require("lodash.snakecase");
const capitalize = require("lodash.capitalize");
const replace = require("lodash.replace");
const node_fetch_1 = __importDefault(require("node-fetch"));
const POLICY_URL = 'https://awspolicygen.s3.amazonaws.com/js/policies.js';
const POLICY_JSON = path_1.resolve(__dirname, '../generated/policies.json');
const FILE_ACTIONS_TS = path_1.resolve(__dirname, '../generated/Actions.ts');
const FILE_SERVICES_TS = path_1.resolve(__dirname, '../generated/Services.ts');
const FILE_ARN_TEMPLATE_TS = path_1.resolve(__dirname, '../generated/ArnTemplates.ts');
class PolicyGenerator {
    constructor(logger) {
        this.logger = logger;
    }
    async fetchPolicyDescriptor(descriptorUrl) {
        this.logger.info(`Fetching IAM policy metadata from ${descriptorUrl} `);
        const response = await node_fetch_1.default(descriptorUrl);
        const policyJs = await response.text();
        const policyJsonString = policyJs.substring('app.PolicyEditorConfig='.length);
        const policyJson = JSON.parse(policyJsonString);
        this.logger.info('Saving policy file.');
        fs_1.writeFileSync(POLICY_JSON, JSON.stringify(policyJson, null, 4));
        this.policyJson = policyJson;
    }
    parseServiceName(serviceName) {
        const plain = serviceName.replace('Amazon ', '').replace('AWS ', '');
        const upperCamelCase = capitalize(camelCase(plain));
        const screamingSnakeCase = toUpper(replace(replace(plain, /-|\(|\)|\./g, ''), / +/g, '_'));
        return { plain, upperCamelCase, screamingSnakeCase };
    }
    generateContent(contentGeneratorLoop, contentHeader = '', contentFooter = '') {
        let content = '';
        content += contentHeader;
        foreach(this.policyJson.serviceMap, (val, key) => {
            const serviceName = this.parseServiceName(key);
            const extractedValue = val;
            content += contentGeneratorLoop(serviceName, extractedValue);
        });
        content += contentFooter;
        return content;
    }
    generateServiceContent() {
        const contentHeader = 'export enum Service {\n';
        const contentGeneratorLoop = (serviceName, extractedValue) => {
            return `  ${serviceName.screamingSnakeCase} = '${extractedValue.StringPrefix}',\n`;
        };
        const contentFooter = '}\n';
        return this.generateContent(contentGeneratorLoop, contentHeader, contentFooter);
    }
    generateServiceArnContent() {
        const contentHeader = 'export enum ServiceArnTemplates {\n';
        const contentGeneratorLoop = (serviceName, extractedValue) => {
            return `  ${serviceName.screamingSnakeCase} = '${extractedValue.ArnFormat}',\n`;
        };
        const contentFooter = '}\n';
        return this.generateContent(contentGeneratorLoop, contentHeader, contentFooter);
    }
    generatePolicyActionsContent() {
        const contentGeneratorLoop = (serviceName, extractedValue) => {
            let content = `export enum ${serviceName.screamingSnakeCase} {\n`;
            const serviceString = extractedValue.StringPrefix;
            const actionsContent = extractedValue.Actions.map((action) => {
                const actionName = toUpper(snakeCase(action));
                return `  ${actionName} = '${serviceString}:${action}'`;
            }).join(',\n');
            content += actionsContent + ',\n}\n';
            return content;
        };
        return this.generateContent(contentGeneratorLoop);
    }
    generateFiles(servicesOutFileName, actionsOutFileName, arnTemplatesOutFileName) {
        logger.info('Generating TS file containing Supported IAM Services enum.');
        const servicesContent = this.generateServiceContent();
        fs_1.writeFileSync(servicesOutFileName, servicesContent);
        logger.info('Generating TS file containing AWS Service Policies enums.');
        const actionsContent = this.generatePolicyActionsContent();
        fs_1.writeFileSync(actionsOutFileName, actionsContent);
        logger.info('Generating TS file containing ServiceArn');
        const serviceArnTemplatesContent = this.generateServiceArnContent();
        fs_1.writeFileSync(arnTemplatesOutFileName, serviceArnTemplatesContent);
    }
}
exports.PolicyGenerator = PolicyGenerator;
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple(),
        }),
    ],
});
const generator = new PolicyGenerator(logger);
generator
    .fetchPolicyDescriptor(POLICY_URL)
    .then(() => {
    generator.generateFiles(FILE_SERVICES_TS, FILE_ACTIONS_TS, FILE_ARN_TEMPLATE_TS);
})
    .then(() => logger.info('library data built. Please import package and have fun!'));
//# sourceMappingURL=PolicyGenerator.js.map