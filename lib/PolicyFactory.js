"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Effect;
(function (Effect) {
    Effect["ALLOW"] = "Allow";
    Effect["DENY"] = "Deny";
})(Effect = exports.Effect || (exports.Effect = {}));
class PolicyFactory {
    constructor(props) {
        this.effect = Effect.ALLOW;
        this.resources = [];
        this.actions = [];
        if (props) {
            const { effect, resources, actions } = props;
            this.effect = effect ? effect : this.effect;
            this.resources = resources ? resources : this.resources;
            if (actions) {
                actions.forEach(action => {
                    this.addAction(action);
                });
            }
        }
    }
    setEffect(effect) {
        this.effect = effect;
        return this;
    }
    addResource(arn) {
        this.resources.push(arn);
        return this;
    }
    addResources(resources) {
        resources.forEach(resource => {
            this.addResource(resource);
        });
        return this;
    }
    addAction(action) {
        this.actions.push(action);
        return this;
    }
    addActions(actions) {
        actions.forEach(action => {
            this.addAction(action);
        });
        return this;
    }
    buildPolicy() {
        const { effect, resources, actions } = this;
        return JSON.stringify({ effect, resources, actions });
    }
}
exports.PolicyFactory = PolicyFactory;
//# sourceMappingURL=PolicyFactory.js.map