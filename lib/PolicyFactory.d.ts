export declare enum Effect {
    ALLOW = "Allow",
    DENY = "Deny"
}
export interface PolicyFactoryProps {
    effect?: Effect | string;
    resources?: string[];
    actions?: string[];
}
export declare class PolicyFactory {
    protected effect: string;
    protected resources: string[];
    protected actions: string[];
    constructor(props?: PolicyFactoryProps);
    setEffect(effect: Effect): this;
    addResource(arn: string): this;
    addResources(resources: string[]): this;
    addAction(action: string): this;
    addActions(actions: string[]): this;
    buildPolicy(): string;
}
