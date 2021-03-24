import { ParsedWsdl } from "./models/parsed-wsdl";
export interface Options {
    emitDefinitionsOnly: boolean;
}
export declare function generate(parsedWsdl: ParsedWsdl, outDir: string, options: Options): Promise<void>;
//# sourceMappingURL=generator.d.ts.map