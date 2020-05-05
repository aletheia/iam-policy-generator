import { Logger } from 'winston';
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
export declare class PolicyGenerator {
    logger: Logger;
    policyJson?: AWSPolicyJson;
    constructor(logger: Logger);
    fetchPolicyDescriptor(descriptorUrl: string): Promise<void>;
    parseServiceName(serviceName: string): ServiceName;
    generateContent(contentGeneratorLoop: Function, contentHeader?: string, contentFooter?: string): string;
    generateServiceContent(): string;
    generateServiceArnContent(): string;
    generatePolicyActionsContent(): string;
    generateFiles(servicesOutFileName: string, actionsOutFileName: string, arnTemplatesOutFileName: string): void;
}
export {};
