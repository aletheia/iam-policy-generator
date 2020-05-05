"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_iam_1 = require("@aws-cdk/aws-iam");
const PolicyFactory_1 = require("./PolicyFactory");
class PolicyStatementFactory extends PolicyFactory_1.PolicyFactory {
    build() {
        const iamEffect = aws_iam_1.Effect[this.effect];
        return new aws_iam_1.PolicyStatement({
            effect: iamEffect,
            resources: this.resources,
            actions: this.actions,
        });
    }
}
exports.PolicyStatementFactory = PolicyStatementFactory;
//# sourceMappingURL=PolicyStatementFactory.js.map