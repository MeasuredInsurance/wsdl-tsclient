"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedWsdl = void 0;
var sanitize_filename_1 = __importDefault(require("sanitize-filename"));
var ParsedWsdl = /** @class */ (function () {
    function ParsedWsdl() {
        this.definitions = [];
        this.ports = [];
        this.services = [];
    }
    ParsedWsdl.prototype.findDefinition = function (definitionName) {
        return this.definitions.find(function (def) { return def.name === definitionName; });
    };
    ParsedWsdl.prototype.findNonCollisionDefinitionName = function (defName) {
        var definitionName = sanitize_filename_1.default(defName);
        if (!this.definitions.find(function (def) { return def.name === definitionName; })) {
            return definitionName;
        }
        var _loop_1 = function (i) {
            // TODO: Unhardcode `20`
            if (!this_1.definitions.find(function (def) { return def.name === "" + definitionName + i; })) {
                return { value: "" + definitionName + i };
            }
        };
        var this_1 = this;
        for (var i = 1; i < 30; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        throw new Error("Out of stack for \"" + definitionName + "\", there's probably cyclic definition");
    };
    return ParsedWsdl;
}());
exports.ParsedWsdl = ParsedWsdl;
//# sourceMappingURL=parsed-wsdl.js.map