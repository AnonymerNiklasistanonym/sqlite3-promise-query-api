// Package imports
import chai from "chai"
import { describe } from "mocha"
import path from "path"
// Local imports
import { createLogMethod, getTestLogger } from "../../logger"
import db from "../../../src/index"
import { itAllowFail } from "../../allowFail"
// Type imports
import type { SqliteInternalError } from "../../../src/index"

const githubCiMaxTimeout = 8000

export default (databaseDirPath: string): Mocha.Suite => {
    return describe("sqlite3", () => {
        const logger = getTestLogger("sqlite3")
        const logMethod = createLogMethod(logger)

        itAllowFail("remove", process.platform === "win32", async () => {
            const databasePath = path.join(databaseDirPath, "remove.db")
            await db.sqlite3.remove(databasePath, logMethod)
            const exists = await db.sqlite3.exists(databasePath, logMethod)
            chai.expect(exists).to.equal(false, "Database does not exist")
        })
        itAllowFail("create", process.platform === "win32", async () => {
            const databasePath = path.join(databaseDirPath, "create.db")
            await db.sqlite3.remove(databasePath, logMethod)
            const testDb = await db.sqlite3.create(databasePath, logMethod)
            chai.expect(testDb).to.not.equal(
                undefined,
                "Database not undefined",
            )
            const exists = await db.sqlite3.exists(databasePath, logMethod)
            chai.expect(exists).to.equal(true, "Database exists")
            const testDb2 = await db.sqlite3.create(databasePath, logMethod)
            chai.expect(testDb2).to.not.equal(
                undefined,
                "Database not undefined",
            )
        })
        itAllowFail("open", process.platform === "win32", async () => {
            const databasePath = path.join(databaseDirPath, "open.db")

            await db.sqlite3.remove(databasePath, logMethod)
            await db.sqlite3.create(databasePath, logMethod)
            const dbReadWrite = await db.sqlite3.open(databasePath, logMethod)
            chai.expect(dbReadWrite).to.not.equal(
                undefined,
                "Database not undefined",
            )

            await db.sqlite3.remove(databasePath, logMethod)
            await db.sqlite3.create(databasePath, logMethod)
            const dbReadOnly = await db.sqlite3.open(databasePath, logMethod, {
                readOnly: true,
            })
            chai.expect(dbReadOnly).to.not.equal(
                undefined,
                "Database not undefined",
            )

            await db.sqlite3.remove(databasePath, logMethod)
            let throwsException1 = false
            try {
                await db.sqlite3.open(databasePath, logMethod)
            } catch (error) {
                throwsException1 = true
                chai.expect((error as SqliteInternalError).code).to.deep.equal(
                    db.sqlite3.ErrorCodeOpen.SQLITE_CANTOPEN,
                )
            }
            chai.expect(throwsException1).to.equal(true)

            await db.sqlite3.remove(databasePath, logMethod)
            let throwsException2 = false
            try {
                await db.sqlite3.open(databasePath, logMethod, {
                    readOnly: true,
                })
            } catch (error) {
                throwsException2 = true
                chai.expect((error as SqliteInternalError).code).to.deep.equal(
                    db.sqlite3.ErrorCodeOpen.SQLITE_CANTOPEN,
                )
            }
            chai.expect(throwsException2).to.equal(true)
        }).timeout(githubCiMaxTimeout)
    })
}
