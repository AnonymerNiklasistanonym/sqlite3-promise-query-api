// Package imports
import { mkdirSync, rmSync as rm } from "fs"
import { describe } from "mocha"
import os from "os"
import path from "path"
// Local imports
import core from "./sqlite3_promise_query_api/core.test"
import examples from "./sqlite3_promise_query_api/examples.test"

describe("sqlite3-promise-query-api", () => {
    const databaseDirPath = path.join(os.tmpdir(), "database")
    rm(databaseDirPath, { force: true, recursive: true })
    mkdirSync(databaseDirPath, { recursive: true })

    core(databaseDirPath)
    examples(databaseDirPath)
})
