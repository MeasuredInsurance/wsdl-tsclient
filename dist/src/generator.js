"use strict";
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
exports.generate = void 0;
var path_1 = __importDefault(require("path"));
var camelcase_1 = __importDefault(require("camelcase"));
var ts_morph_1 = require("ts-morph");
var logger_1 = require("./utils/logger");
function createProperty(name, type, doc, isArray, optional) {
    if (optional === void 0) { optional = true; }
    return {
        kind: ts_morph_1.StructureKind.PropertySignature,
        name: name,
        docs: [doc],
        hasQuestionToken: true,
        type: isArray ? "Array<" + type + ">" : type,
    };
}
function generateDefinitionFile(project, definition, defDir, stack, generated) {
    var defName = camelcase_1.default(definition.name, { pascalCase: true });
    var defFilePath = path_1.default.join(defDir, defName + ".ts");
    var defFile = project.createSourceFile(defFilePath, "", {
        overwrite: true,
    });
    generated.push(definition);
    var definitionImports = [];
    var definitionProperties = [];
    for (var _i = 0, _a = definition.properties; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (prop.kind === "PRIMITIVE") {
            // e.g. string
            definitionProperties.push(createProperty(prop.name, prop.type, prop.description, prop.isArray));
        }
        else if (prop.kind === "REFERENCE") {
            // e.g. Items
            if (!generated.includes(prop.ref)) {
                // Wasn't generated yet
                generateDefinitionFile(project, prop.ref, defDir, __spreadArray(__spreadArray([], stack), [prop.ref.name]), generated);
            }
            definitionImports.push({
                moduleSpecifier: "./" + prop.ref.name,
                namedImports: [{ name: prop.ref.name }],
            });
            definitionProperties.push(createProperty(prop.name, prop.ref.name, prop.sourceName, prop.isArray));
        }
    }
    defFile.addImportDeclarations(definitionImports);
    defFile.addStatements([
        {
            leadingTrivia: function (writer) { return writer.newLine(); },
            isExported: true,
            name: defName,
            docs: [definition.docs.join("\n")],
            kind: ts_morph_1.StructureKind.Interface,
            properties: definitionProperties,
        },
    ]);
    logger_1.Logger.log("Writing Definition file: " + path_1.default.resolve(path_1.default.join(defDir, defName)) + ".ts");
    defFile.saveSync();
}
function pushIfNotExist(array, value) {
    if (!array.some(function (i) { return i.moduleSpecifier === value.moduleSpecifier; })) {
        array.push(value);
    }
}
function generate(parsedWsdl, outDir, options) {
    return __awaiter(this, void 0, void 0, function () {
        var project, portsDir, servicesDir, defDir, allMethods, allDefintions, clientImports, clientServices, _i, _a, service, serviceFilePath, serviceFile, serviceImports, servicePorts, _b, _c, port, portFilePath, portFile, portImports, portFileMethods, _loop_1, _d, _e, method, clientFilePath, clientFile, createClientDeclaration, indexFilePath, indexFile;
        return __generator(this, function (_f) {
            project = new ts_morph_1.Project();
            portsDir = path_1.default.join(outDir, "ports");
            servicesDir = path_1.default.join(outDir, "services");
            defDir = path_1.default.join(outDir, "definitions");
            allMethods = [];
            allDefintions = [];
            clientImports = [];
            clientServices = [];
            for (_i = 0, _a = parsedWsdl.services; _i < _a.length; _i++) {
                service = _a[_i];
                serviceFilePath = path_1.default.join(servicesDir, service.name + ".ts");
                serviceFile = project.createSourceFile(serviceFilePath, "", {
                    overwrite: true,
                });
                serviceImports = [];
                servicePorts = [];
                for (_b = 0, _c = parsedWsdl.ports; _b < _c.length; _b++) {
                    port = _c[_b];
                    portFilePath = path_1.default.join(portsDir, port.name + ".ts");
                    portFile = project.createSourceFile(portFilePath, "", {
                        overwrite: true,
                    });
                    portImports = [];
                    portFileMethods = [];
                    _loop_1 = function (method) {
                        // TODO: Deduplicate PortImports
                        if (method.paramDefinition !== null &&
                            !allDefintions.includes(method.paramDefinition)) {
                            generateDefinitionFile(project, method.paramDefinition, defDir, [method.paramDefinition.name], allDefintions);
                        }
                        pushIfNotExist(clientImports, {
                            moduleSpecifier: "./definitions/" + method.paramDefinition.name,
                            namedImports: [{ name: method.paramDefinition.name }],
                        });
                        pushIfNotExist(portImports, {
                            moduleSpecifier: path_1.default.join("..", "definitions", method.paramDefinition.name),
                            namedImports: [{ name: method.paramDefinition.name }],
                        });
                        if (method.returnDefinition !== null &&
                            !allDefintions.includes(method.returnDefinition)) {
                            generateDefinitionFile(project, method.returnDefinition, defDir, [method.returnDefinition.name], allDefintions);
                        }
                        pushIfNotExist(clientImports, {
                            moduleSpecifier: "./definitions/" + method.returnDefinition.name,
                            namedImports: [{ name: method.returnDefinition.name }],
                        });
                        pushIfNotExist(portImports, {
                            moduleSpecifier: path_1.default.join("..", "definitions", method.returnDefinition.name),
                            namedImports: [{ name: method.returnDefinition.name }],
                        });
                        // TODO: Deduplicate PortMethods
                        if (!allMethods.some(function (i) { return i.name === method.name; })) {
                            allMethods.push(method);
                        }
                        portFileMethods.push({
                            name: method.paramName,
                            parameters: [
                                {
                                    name: method.paramName,
                                    type: method.paramDefinition ? method.paramDefinition.name : "{}",
                                },
                                {
                                    name: "callback",
                                    type: "(err: any, result: " + (method.paramDefinition ? method.paramDefinition.name : "unknown") + ", rawResponse: any, soapHeader: any, rawRequest: any) => void",
                                },
                            ],
                            returnType: method.returnDefinition ? method.returnDefinition.name : "void",
                        });
                    };
                    for (_d = 0, _e = port.methods; _d < _e.length; _d++) {
                        method = _e[_d];
                        _loop_1(method);
                    } // End of PortMethod
                    if (!options.emitDefinitionsOnly) {
                        serviceImports.push({
                            moduleSpecifier: path_1.default.join("..", "ports", port.name),
                            namedImports: [{ name: port.name }],
                        });
                        servicePorts.push({
                            name: port.name,
                            isReadonly: true,
                            type: port.name,
                        });
                        portFile.addImportDeclarations(portImports);
                        portFile.addStatements([
                            {
                                leadingTrivia: function (writer) { return writer.newLine(); },
                                isExported: true,
                                kind: ts_morph_1.StructureKind.Interface,
                                name: port.name,
                                methods: portFileMethods,
                            },
                        ]);
                        logger_1.Logger.log("Writing Port file: " + path_1.default.resolve(path_1.default.join(portsDir, port.name)) + ".ts");
                        portFile.saveSync();
                    }
                } // End of Port
                if (!options.emitDefinitionsOnly) {
                    clientImports.push({
                        moduleSpecifier: "./services/" + service.name,
                        namedImports: [{ name: service.name }],
                    });
                    clientServices.push({ name: service.name, type: service.name });
                    serviceFile.addImportDeclarations(serviceImports);
                    serviceFile.addStatements([
                        {
                            leadingTrivia: function (writer) { return writer.newLine(); },
                            isExported: true,
                            kind: ts_morph_1.StructureKind.Interface,
                            name: service.name,
                            properties: servicePorts,
                        },
                    ]);
                    logger_1.Logger.log("Writing Service file: " + path_1.default.resolve(path_1.default.join(servicesDir, service.name)) + ".ts");
                    serviceFile.saveSync();
                }
            } // End of Service
            if (!options.emitDefinitionsOnly) {
                clientFilePath = path_1.default.join(outDir, "client.ts");
                clientFile = project.createSourceFile(clientFilePath, "", {
                    overwrite: true,
                });
                clientFile.addImportDeclaration({
                    moduleSpecifier: "soap",
                    namedImports: [
                        { name: "Client", alias: "SoapClient" },
                        { name: "createClientAsync", alias: "soapCreateClientAsync" },
                    ],
                });
                clientFile.addImportDeclarations(clientImports);
                clientFile.addStatements([
                    {
                        leadingTrivia: function (writer) { return writer.newLine(); },
                        isExported: true,
                        kind: ts_morph_1.StructureKind.Interface,
                        // docs: [`${parsedWsdl.name}Client`],
                        name: parsedWsdl.name + "Client",
                        properties: clientServices,
                        extends: ["SoapClient"],
                        methods: allMethods.map(function (method) { return ({
                            name: method.name + "Async",
                            parameters: [
                                {
                                    name: method.paramName,
                                    type: method.paramDefinition ? method.paramDefinition.name : "{}",
                                },
                            ],
                            returnType: "Promise<" + (method.returnDefinition ? method.returnDefinition.name : "unknown") + ">",
                        }); }),
                    },
                ]);
                createClientDeclaration = clientFile.addFunction({
                    name: "createClientAsync",
                    docs: ["Create " + parsedWsdl.name + "Client"],
                    isExported: true,
                    parameters: [
                        {
                            isRestParameter: true,
                            name: "args",
                            type: "Parameters<typeof soapCreateClientAsync>",
                        },
                    ],
                    returnType: "Promise<" + parsedWsdl.name + "Client>", // TODO: `any` keyword is very dangerous
                });
                createClientDeclaration.setBodyText("return soapCreateClientAsync(args[0], args[1], args[2]) as any;");
                logger_1.Logger.log("Writing Client file: " + path_1.default.resolve(path_1.default.join(outDir, "client")) + ".ts");
                clientFile.saveSync();
            }
            indexFilePath = path_1.default.join(outDir, "index.ts");
            indexFile = project.createSourceFile(indexFilePath, "", {
                overwrite: true,
            });
            indexFile.addExportDeclarations(allDefintions.map(function (def) { return ({
                namedExports: [def.name],
                moduleSpecifier: "./definitions/" + def.name,
            }); }));
            if (!options.emitDefinitionsOnly) {
                // TODO: Aggregate all exports during decleartions generation
                // https://ts-morph.com/details/exports
                indexFile.addExportDeclarations([
                    {
                        namedExports: ["createClientAsync", parsedWsdl.name + "Client"],
                        moduleSpecifier: "./client",
                    },
                ]);
                indexFile.addExportDeclarations(parsedWsdl.services.map(function (service) { return ({
                    namedExports: [service.name],
                    moduleSpecifier: "./services/" + service.name,
                }); }));
                indexFile.addExportDeclarations(parsedWsdl.ports.map(function (port) { return ({
                    namedExports: [port.name],
                    moduleSpecifier: "./ports/" + port.name,
                }); }));
            }
            logger_1.Logger.log("Writing Index file: " + path_1.default.resolve(path_1.default.join(outDir, "index")) + ".ts");
            indexFile.saveSync();
            return [2 /*return*/];
        });
    });
}
exports.generate = generate;
//# sourceMappingURL=generator.js.map