import { ParsedWsdl } from "./models/parsed-wsdl";
interface Options {
    modelNamePreffix: string;
    modelNameSuffix: string;
}
export declare function parseWsdl(wsdlPath: string, options: Options): Promise<ParsedWsdl>;
export {};
//# sourceMappingURL=parser.d.ts.map