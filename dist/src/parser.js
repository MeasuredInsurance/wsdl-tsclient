"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWsdl = void 0;
var camelcase_1 = __importDefault(require("camelcase"));
var path = __importStar(require("path"));
var index_1 = require("soap/lib/wsdl/index");
var parsed_wsdl_1 = require("./models/parsed-wsdl");
var file_1 = require("./utils/file");
var javascript_1 = require("./utils/javascript");
var logger_1 = require("./utils/logger");
function findReferenceDefiniton(visited, definitionParts) {
    return visited.find(function (def) { return def.parts === definitionParts; });
}
/**
 * parse definition
 * @param parsedWsdl context of parsed wsdl
 * @param name name of definition
 * @param defParts definition's parts (its properties from wsdl)
 * @param stack definition stack (for deep objects) (immutable)
 * @param visitedDefs set of visited definition (mutable)
 */
function parseDefinition(parsedWsdl, options, name, defParts, stack, visitedDefs) {
    var defName = camelcase_1.default(name, { pascalCase: true });
    var definition = {
        name: "" + options.modelNamePreffix + parsedWsdl.findNonCollisionDefinitionName(defName) + options.modelNameSuffix,
        sourceName: defName,
        docs: [name],
        properties: [],
        description: "",
    };
    visitedDefs.push({ name: definition.name, parts: defParts, definition: definition }); // NOTE: cache reference to this defintion globally (for avoiding circular references)
    if (defParts) {
        // NOTE: `node-soap` has sometimes problem with parsing wsdl files, it includes `defParts.undefined = undefined`
        if ("undefined" in defParts && defParts.undefined === undefined) {
            // TODO: problem while parsing WSDL, maybe report to node-soap
            // TODO: add flag --FailOnWsdlError
            logger_1.Logger.error({
                message: "Problem while generating a definition file",
                path: stack.join("."),
                parts: defParts,
            });
        }
        else {
            Object.entries(defParts).forEach(function (_a) {
                var propName = _a[0], type = _a[1];
                if (propName === "targetNSAlias") {
                    definition.docs.push("targetNSAlias `" + type + "`");
                }
                else if (propName === "targetNamespace") {
                    definition.docs.push("targetNamespace `" + type + "`");
                }
                else if (propName.endsWith("[]")) {
                    var stripedPropName = propName.substring(0, propName.length - 2);
                    // Array of
                    if (typeof type === "string") {
                        // primitive type
                        definition.properties.push({
                            kind: "PRIMITIVE",
                            name: stripedPropName,
                            sourceName: propName,
                            description: type,
                            type: "string",
                            isArray: true,
                        });
                    }
                    else {
                        // With sub-type
                        var visited = findReferenceDefiniton(visitedDefs, type);
                        if (visited) {
                            // By referencing already declared definition, we will avoid circular references
                            definition.properties.push({
                                kind: "REFERENCE",
                                name: stripedPropName,
                                sourceName: propName,
                                ref: visited.definition,
                                isArray: true,
                            });
                        }
                        else {
                            var subDefinition = parseDefinition(parsedWsdl, options, stripedPropName, type, __spreadArray(__spreadArray([], stack), [propName]), visitedDefs);
                            definition.properties.push({
                                kind: "REFERENCE",
                                name: stripedPropName,
                                sourceName: propName,
                                ref: subDefinition,
                                isArray: true,
                            });
                        }
                    }
                }
                else {
                    if (typeof type === "string") {
                        // primitive type
                        definition.properties.push({
                            kind: "PRIMITIVE",
                            name: propName,
                            sourceName: propName,
                            description: type,
                            type: "string",
                            isArray: false,
                        });
                    }
                    else {
                        // With sub-type
                        var reference = findReferenceDefiniton(visitedDefs, type);
                        if (reference) {
                            // By referencing already declared definition, we will avoid circular references
                            definition.properties.push({
                                kind: "REFERENCE",
                                name: propName,
                                sourceName: propName,
                                description: "",
                                ref: reference.definition,
                                isArray: false,
                            });
                        }
                        else {
                            var subDefinition = parseDefinition(parsedWsdl, options, propName, type, __spreadArray(__spreadArray([], stack), [propName]), visitedDefs);
                            definition.properties.push({
                                kind: "REFERENCE",
                                name: propName,
                                sourceName: propName,
                                ref: subDefinition,
                                isArray: false,
                            });
                        }
                    }
                }
            });
        }
    }
    else {
        // TODO: Doesn't have parts :(
    }
    parsedWsdl.definitions.push(definition);
    return definition;
}
// TODO: Add logs
// TODO: Add comments for services, ports, methods and client
function parseWsdl(wsdlPath, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    index_1.open_wsdl(wsdlPath, function (err, wsdl) {
                        var _a, _b, _c;
                        if (err) {
                            return reject(err);
                        }
                        if (wsdl === undefined) {
                            return reject(new Error("WSDL is undefined"));
                        }
                        wsdl.describeServices();
                        var parsedWsdl = new parsed_wsdl_1.ParsedWsdl();
                        var filename = path.basename(wsdlPath);
                        parsedWsdl.name = camelcase_1.default(file_1.stripExtension(filename), {
                            pascalCase: true,
                        });
                        parsedWsdl.wsdlFilename = path.basename(filename);
                        parsedWsdl.wsdlPath = path.resolve(wsdlPath);
                        var visitedDefinitions = [];
                        var allMethods = [];
                        var allPorts = [];
                        var services = [];
                        for (var _i = 0, _d = Object.entries(wsdl.definitions.services); _i < _d.length; _i++) {
                            var _e = _d[_i], serviceName = _e[0], service = _e[1];
                            var servicePorts = []; // TODO: Convert to Array
                            for (var _f = 0, _g = Object.entries(service.ports); _f < _g.length; _f++) {
                                var _h = _g[_f], portName = _h[0], port = _h[1];
                                // [SI_ManageOrder_O]
                                var portMethods = [];
                                for (var _j = 0, _k = Object.entries(port.binding.methods); _j < _k.length; _j++) {
                                    var _l = _k[_j], methodName = _l[0], method = _l[1];
                                    // [O_CustomerChange]
                                    // TODO: Deduplicate code below by refactoring it to external function. Is it possible ?
                                    var paramName = "request";
                                    var inputDefinition = null; // default type
                                    if (method.input) {
                                        if (method.input.$name) {
                                            paramName = method.input.$name;
                                        }
                                        var inputMessage = wsdl.definitions.messages[method.input.$name];
                                        if (inputMessage.element) {
                                            // TODO: if $type not defined, inline type into function declartion
                                            var typeName = (_a = inputMessage.element.$type) !== null && _a !== void 0 ? _a : inputMessage.element.$name;
                                            var type = parsedWsdl.findDefinition((_b = inputMessage.element.$type) !== null && _b !== void 0 ? _b : inputMessage.element.$name);
                                            inputDefinition = type
                                                ? type
                                                : parseDefinition(parsedWsdl, options, typeName, inputMessage.parts, [typeName], visitedDefinitions);
                                        }
                                    }
                                    var outputDefinition = null; // default type
                                    if (method.output) {
                                        var outputMessage = wsdl.definitions.messages[method.output.$name];
                                        if (outputMessage.element) {
                                            // TODO: if input doesn't have $type, use $name for definition file
                                            var typeName = (_c = outputMessage.element.$type) !== null && _c !== void 0 ? _c : outputMessage.element.$name;
                                            var type = parsedWsdl.findDefinition(typeName);
                                            outputDefinition = type
                                                ? type
                                                : parseDefinition(parsedWsdl, options, typeName, outputMessage.parts, [typeName], visitedDefinitions);
                                        }
                                    }
                                    var camelParamName = camelcase_1.default(paramName);
                                    var portMethod = {
                                        name: methodName,
                                        paramName: javascript_1.reservedKeywords.includes(camelParamName)
                                            ? camelParamName + "Param"
                                            : camelParamName,
                                        paramDefinition: inputDefinition,
                                        returnDefinition: outputDefinition, // TODO: Use string from generated definition files
                                    };
                                    portMethods.push(portMethod);
                                    allMethods.push(portMethod);
                                }
                                var servicePort = {
                                    name: camelcase_1.default(portName, { pascalCase: true }),
                                    sourceName: portName,
                                    methods: portMethods,
                                };
                                servicePorts.push(servicePort);
                                allPorts.push(servicePort);
                            } // End of Port cycle
                            services.push({
                                name: camelcase_1.default(serviceName, { pascalCase: true }),
                                sourceName: serviceName,
                                ports: servicePorts,
                            });
                        } // End of Service cycle
                        parsedWsdl.services = services;
                        parsedWsdl.ports = allPorts;
                        return resolve(parsedWsdl);
                    });
                })];
        });
    });
}
exports.parseWsdl = parseWsdl;
//# sourceMappingURL=parser.js.map