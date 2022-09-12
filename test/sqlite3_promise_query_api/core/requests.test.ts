// Package imports
import path from "path"
import chai from "chai"
import { describe } from "mocha"
// Local imports
import { createLogMethod, getTestLogger } from "../../logger"
import db from "../../../src/index"
import { itAllowFail } from "../../allowFail"
// Type imports
import type { CreateTableColumn, SqliteInternalError } from "../../../src/index"

const githubCiMaxTimeout = 8000

export default (databaseDirPath: string): Mocha.Suite => {
    return describe("requests", () => {
        const logger = getTestLogger("requests")
        const logMethod = createLogMethod(logger)

        const tableName = "test"
        const tableColumns: CreateTableColumn[] = [
            {
                name: "blob",
                type: db.queries.CreateTableColumnType.BLOB,
            },
            {
                name: "integer",
                type: db.queries.CreateTableColumnType.INTEGER,
            },
            {
                name: "numeric",
                type: db.queries.CreateTableColumnType.NUMERIC,
            },
            {
                name: "real",
                type: db.queries.CreateTableColumnType.REAL,
            },
            {
                name: "text",
                type: db.queries.CreateTableColumnType.TEXT,
            },
            {
                name: "unique_text_and_not_null",
                options: { notNull: true, unique: true },
                type: db.queries.CreateTableColumnType.TEXT,
            },
        ]
        interface DbAllColumnsOutput {
            blob: string
            integer: number
            numeric: number
            real: number
            text: string
            // eslint-disable-next-line camelcase
            unique_text_and_not_null: string
        }
        interface DbLastColumnOutput {
            // eslint-disable-next-line camelcase
            unique_text_and_not_null: string
        }
        itAllowFail("post", process.platform === "win32", async () => {
            const databasePath = path.join(databaseDirPath, "post.db")
            await db.sqlite3.remove(databasePath, logMethod)
            await db.sqlite3.create(databasePath, logMethod)

            const queryCreateTable = db.queries.createTable(
                tableName,
                tableColumns,
            )
            const postResultCreateTable = await db.requests.post(
                databasePath,
                queryCreateTable,
                undefined,
                logMethod,
            )
            chai.expect(postResultCreateTable.changes).to.be.a("number")
            chai.expect(postResultCreateTable.lastID).to.be.a("number")

            const queryInsert = db.queries.insert(
                tableName,
                tableColumns.map((a) => a.name),
            )
            const postResultInsert1 = await db.requests.post(
                databasePath,
                queryInsert,
                ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
                logMethod,
            )
            chai.expect(postResultInsert1.changes).to.equal(1)
            chai.expect(postResultInsert1.lastID).to.be.a("number")
            const postResultInsert2 = await db.requests.post(
                databasePath,
                queryInsert,
                ["blobData", 1234, 12, 22.3456, "textData", "unique2"],
                logMethod,
            )
            chai.expect(postResultInsert2.changes).to.equal(1)
            chai.expect(postResultInsert2.lastID).to.be.a("number")
            chai.expect(postResultInsert2.lastID).to.not.equal(
                postResultInsert1.lastID,
                "Inserted row ids differ",
            )

            let throwsException1 = false
            try {
                await db.requests.post(
                    databasePath,
                    queryInsert,
                    ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
                    logMethod,
                )
            } catch (error) {
                throwsException1 = true
                chai.expect(db.requests.isDatabaseError(error)).to.equal(
                    true,
                    JSON.stringify(error),
                )
                chai.expect((error as SqliteInternalError).code).to.equal(
                    db.requests.ErrorCodePostRequest.SQLITE_CONSTRAINT,
                )
            }
            chai.expect(throwsException1).to.equal(true)

            let throwsException2 = false
            try {
                await db.requests.post(
                    databasePath,
                    queryInsert,
                    ["blobData", 1234, 12, 22.3456, "textData"],
                    logMethod,
                )
            } catch (error) {
                throwsException2 = true
                chai.expect(db.requests.isDatabaseError(error)).to.equal(
                    true,
                    JSON.stringify(error),
                )
                chai.expect((error as SqliteInternalError).code).to.equal(
                    db.requests.ErrorCodePostRequest.SQLITE_CONSTRAINT,
                )
            }
            chai.expect(throwsException2).to.equal(true)
        }).timeout(githubCiMaxTimeout)
        itAllowFail("get each", process.platform === "win32", async () => {
            const databasePath = path.join(databaseDirPath, "getEach.db")
            await db.sqlite3.remove(databasePath, logMethod)
            await db.sqlite3.create(databasePath, logMethod)

            await db.requests.post(
                databasePath,
                db.queries.createTable(tableName, tableColumns),
                undefined,
                logMethod,
            )

            const querySelectAllColumns = db.queries.select(
                tableName,
                tableColumns.map((a) => a.name),
                { whereColumn: "integer" },
            )
            const querySelectLastColumn = db.queries.select(
                tableName,
                [tableColumns.map((a) => a.name).slice(-1)[0]],
                { whereColumn: "integer" },
            )

            const getResultSelectAllColumns1 = await db.requests.getEach(
                databasePath,
                querySelectAllColumns,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectAllColumns1).to.equal(
                undefined,
                "No table entry to select",
            )
            const getResultSelectLastColumn1 = await db.requests.getEach(
                databasePath,
                querySelectLastColumn,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectLastColumn1).to.equal(
                undefined,
                "No table entry to select",
            )

            const queryInsert = db.queries.insert(
                tableName,
                tableColumns.map((a) => a.name),
            )
            await db.requests.post(
                databasePath,
                queryInsert,
                ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
                logMethod,
            )

            const getResultSelectAllColumns2 = await db.requests.getEach(
                databasePath,
                querySelectAllColumns,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectAllColumns2).to.equal(
                undefined,
                "No matching table entry to select",
            )
            const getResultSelectLastColumn2 = await db.requests.getEach(
                databasePath,
                querySelectLastColumn,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectLastColumn2).to.equal(
                undefined,
                "No matching table entry to select",
            )

            const getResultSelectAllColumns3 =
                await db.requests.getEach<DbAllColumnsOutput>(
                    databasePath,
                    querySelectAllColumns,
                    [1234],
                    logMethod,
                )
            if (getResultSelectAllColumns3) {
                chai.expect(getResultSelectAllColumns3).to.not.equal(undefined)
                chai.expect(getResultSelectAllColumns3.blob).to.equal(
                    "blobData",
                )
                chai.expect(getResultSelectAllColumns3.integer).to.equal(1234)
                chai.expect(getResultSelectAllColumns3.numeric).to.equal(12)
                chai.expect(getResultSelectAllColumns3.real).to.equal(22.3456)
                chai.expect(getResultSelectAllColumns3.text).to.equal(
                    "textData",
                )
                chai.expect(
                    getResultSelectAllColumns3.unique_text_and_not_null,
                ).to.equal("unique1")
            } else {
                chai.assert(false)
            }
            const getResultSelectLastColumn3 =
                await db.requests.getEach<DbLastColumnOutput>(
                    databasePath,
                    querySelectLastColumn,
                    [1234],
                    logMethod,
                )
            if (getResultSelectLastColumn3) {
                chai.expect(getResultSelectLastColumn3).to.not.equal(undefined)
                chai.expect(
                    getResultSelectLastColumn3.unique_text_and_not_null,
                ).to.equal("unique1")
            } else {
                chai.assert(false)
            }
        }).timeout(githubCiMaxTimeout)
        itAllowFail("get all", process.platform === "win32", async () => {
            const databasePath = path.join(databaseDirPath, "getAll.db")
            await db.sqlite3.remove(databasePath, logMethod)
            await db.sqlite3.create(databasePath, logMethod)

            await db.requests.post(
                databasePath,
                db.queries.createTable(tableName, tableColumns),
                undefined,
                logMethod,
            )

            const querySelectAllColumns = db.queries.select(
                tableName,
                tableColumns.map((a) => a.name),
                { whereColumn: "integer" },
            )
            const querySelectLastColumn = db.queries.select(
                tableName,
                [tableColumns.map((a) => a.name).slice(-1)[0]],
                { whereColumn: "integer" },
            )

            const getResultSelectAllColumns1 = await db.requests.getAll(
                databasePath,
                querySelectAllColumns,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectAllColumns1).to.deep.equal(
                [],
                "No table entries to select",
            )
            const getResultSelectLastColumn1 = await db.requests.getAll(
                databasePath,
                querySelectLastColumn,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectLastColumn1).to.deep.equal(
                [],
                "No table entries to select",
            )

            const queryInsert = db.queries.insert(
                tableName,
                tableColumns.map((a) => a.name),
            )
            await db.requests.post(
                databasePath,
                queryInsert,
                ["blobData", 1234, 12, 22.3456, "textData", "unique1"],
                logMethod,
            )

            const getResultSelectAllColumns2 = await db.requests.getAll(
                databasePath,
                querySelectAllColumns,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectAllColumns2).to.deep.equal(
                [],
                "No matching table entries to select",
            )
            const getResultSelectLastColumn2 = await db.requests.getAll(
                databasePath,
                querySelectLastColumn,
                [42],
                logMethod,
            )
            chai.expect(getResultSelectLastColumn2).to.deep.equal(
                [],
                "No matching table entries to select",
            )

            const getResultSelectAllColumns3 =
                await db.requests.getAll<DbAllColumnsOutput>(
                    databasePath,
                    querySelectAllColumns,
                    [1234],
                    logMethod,
                )
            chai.expect(getResultSelectAllColumns3.length).to.equal(1)
            chai.expect(getResultSelectAllColumns3[0].blob).to.equal("blobData")
            chai.expect(getResultSelectAllColumns3[0].integer).to.equal(1234)
            chai.expect(getResultSelectAllColumns3[0].numeric).to.equal(12)
            chai.expect(getResultSelectAllColumns3[0].real).to.equal(22.3456)
            chai.expect(getResultSelectAllColumns3[0].text).to.equal("textData")
            chai.expect(
                getResultSelectAllColumns3[0].unique_text_and_not_null,
            ).to.equal("unique1")
            const getResultSelectLastColumn3 =
                await db.requests.getAll<DbLastColumnOutput>(
                    databasePath,
                    querySelectLastColumn,
                    [1234],
                    logMethod,
                )
            chai.expect(getResultSelectLastColumn3.length).to.equal(1)
            chai.expect(
                getResultSelectLastColumn3[0].unique_text_and_not_null,
            ).to.equal("unique1")
        }).timeout(githubCiMaxTimeout)
    })
}
