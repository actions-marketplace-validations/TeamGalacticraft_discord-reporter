import * as parser from "fast-xml-parser";
import * as glob from "@actions/glob";

export interface Tests {
    total: number,
    failed: number
    skipped: number
}

export async function parseTests(dir: string): Promise<Tests> {
    if (dir.endsWith("/")) dir = dir.substr(0, dir.length - 1);
    const globber = await glob.create(`${dir}/TEST-*.xml`);
    let tests: Tests = {
        total: 0,
        failed: 0,
        skipped: 0
    }

    for await (const file of globber.globGenerator()) {
        const jsonObj: {
            testsuite: {
                attr_failures: number,
                attr_skipped: number,
                attr_tests: number,
                attr_time: number,
                attr_timestamp: string
                testcase: {
                    attr_classname: string,
                    attr_name: string,
                    attr_time: number
                }[]
            }
        } = parser.parse(file, {
            ignoreAttributes: false,
            attributeNamePrefix: "attr_"
        });

        tests.total += Number(jsonObj.testsuite.attr_tests);
        tests.failed += Number(jsonObj.testsuite.attr_failures);
        tests.skipped += Number(jsonObj.testsuite.attr_skipped);
    }

    return tests;
}