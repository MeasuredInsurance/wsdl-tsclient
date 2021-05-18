"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedWsdl = void 0;
var sanitize_filename_1 = __importDefault(require("sanitize-filename"));
var MAX_STACK = 30;
var ParsedWsdl = /** @class */ (function () {
    function ParsedWsdl() {
        this.definitions = [];
        this.ports = [];
        this.services = [];
    }
    /** Find definition by it's name */
    ParsedWsdl.prototype.findDefinition = function (definitionName) {
        return this.definitions.find(function (def) { return def.name === definitionName; });
    };
    /**
     * To make every definition's name unique.
     * If definition with same name exists, suffix it with incremented number
     */
    ParsedWsdl.prototype.findNonCollisionDefinitionName = function (defName) {
        var definitionName = sanitize_filename_1.default(defName);
        if (!this.definitions.find(function (def) { return def.name === definitionName; })) {
            return definitionName;
        }
        var _loop_1 = function (i) {
            if (!this_1.definitions.find(function (def) { return def.name === "" + definitionName + i; })) {
                return { value: "" + definitionName + i };
            }
        };
        var this_1 = this;
        for (var i = 1; i < MAX_STACK; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        throw new Error("Out of stack (" + MAX_STACK + ") for \"" + definitionName + "\", there's probably cyclic definition");
    };
    return ParsedWsdl;
}());
exports.ParsedWsdl = ParsedWsdl;
//# sourceMappingURL=parsed-wsdl.js.map