import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";

const target = "Dummy";

test(target, async t => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async t => {
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyList.ts`), true);
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyRequest.ts`), true);
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyResponse.ts`), true);
        t.equal(existsSync(`${outdir}/dummy/definitions/DummyResult.ts`), true);
        t.end();
    });
});