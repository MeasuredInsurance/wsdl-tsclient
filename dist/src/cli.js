#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_parser_1 = __importDefault(require("yargs-parser"));
var path_1 = __importDefault(require("path"));
var logger_1 = require("./utils/logger");
var index_1 = require("./index");
var package_json_1 = __importDefault(require("../package.json"));
var conf = yargs_parser_1.default(process.argv.slice(2));
if (conf.h || conf.help) {
    process.stdout.write("Version: " + package_json_1.default.version + "\n");
    process.stdout.write("Syntax: wsdl-tsclient [options] [path]\n");
    process.stdout.write("\n");
    process.stdout.write("Example: wsdl-tsclient file.wsdl -o ./generated/\n");
    process.stdout.write("\t wsdl-tsclient ./res/**/*.wsdl -o ./generated/\n");
    process.stdout.write("\n");
    process.stdout.write("Options:\n");
    // process.stdout.write("\tWSDL_PATH\tpath to your wsdl file(s)\n");
    process.stdout.write("\t-o\t\t\tOutput dir\n");
    process.stdout.write("\t-h, --help\t\tPrint this message\n");
    process.stdout.write("\t-v, --version\t\tPrint version\n");
    process.stdout.write("\t--emitDefinitionsOnly\tGenerate only Definitions\n");
    process.stdout.write("\t--modelNamePreffix\n");
    process.stdout.write("\t--modelNameSuffix\n");
    process.stdout.write("\t--quiet\t\t\tSuppress logs\n");
    process.stdout.write("\t--verbose\t\tPrint verbose logs\n");
    process.stdout.write("\t--no-color\t\tLogs without colors\n");
    // TODO: Finish --js
    process.exit(0);
}
if (conf.v || conf.version) {
    logger_1.Logger.log(package_json_1.default.version + "\n");
    process.exit(0);
}
//
if (conf["no-color"]) {
    logger_1.Logger.colors = false;
}
if (conf.verbose) {
    logger_1.Logger.isDebug = true;
}
if (conf.quiet) {
    logger_1.Logger.isDebug = false;
    logger_1.Logger.isInfo = false;
    logger_1.Logger.isError = false;
}
//
var options = {};
if (conf.emitDefinitionsOnly) {
    options.emitDefinitionsOnly = true;
}
if (conf.modelNamePrefix) {
    options.modelNamePreffix = conf.modelNamePrefix;
}
if (conf.modelNameSuffix) {
    options.modelNameSuffix = conf.modelNameSuffix;
}
//
if (conf._ === undefined || conf._.length === 0) {
    logger_1.Logger.error("Node wsdl files found");
    logger_1.Logger.debug("Path: " + conf._);
    process.exit(1);
}
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var outDir, errorOccured, matches, _i, matches_1, match, wsdlPath, wsdlName, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(conf.o === undefined || conf.o.length === 0)) return [3 /*break*/, 1];
                    logger_1.Logger.error("You forget to pass path to Output directory -o");
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 1:
                    outDir = path_1.default.resolve(conf.o);
                    errorOccured = false;
                    matches = conf._;
                    if (matches.length > 1) {
                        logger_1.Logger.debug(matches.map(function (m) { return path_1.default.resolve(m); }).join("\n"));
                        logger_1.Logger.log("Found " + matches.length + " wsdl files");
                    }
                    _i = 0, matches_1 = matches;
                    _a.label = 2;
                case 2:
                    if (!(_i < matches_1.length)) return [3 /*break*/, 7];
                    match = matches_1[_i];
                    wsdlPath = path_1.default.resolve(match);
                    wsdlName = path_1.default.basename(wsdlPath);
                    logger_1.Logger.log("Generating soap client from \"" + wsdlName + "\"");
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, index_1.parseAndGenerate(wsdlPath, path_1.default.join(outDir), options)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    logger_1.Logger.error("Error occured while generating client \"" + wsdlName + "\"");
                    logger_1.Logger.error("\t" + err_1);
                    errorOccured = true;
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    if (errorOccured) {
                        process.exit(1);
                    }
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
})();
//# sourceMappingURL=cli.js.map