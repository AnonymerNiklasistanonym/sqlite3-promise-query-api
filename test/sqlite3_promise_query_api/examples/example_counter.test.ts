// Package imports
import chai from "chai"
import { describe } from "mocha"
import path from "path"
// Local imports
import { createLogMethod, getTestLogger } from "../../logger"
import db from "../../../src/index"
import {
    databaseNameElementCounter,
    tableElementCounter,
    viewElementCounterLeaderboard,
} from "./example_counter"

const githubCiMaxTimeout = 8000

export default (databaseDirPath: string): Mocha.Suite => {
    return describe("sqlite3", () => {
        const logger = getTestLogger("sqlite3") //, "debug")
        const logMethod = createLogMethod(logger)
        const databasePath = path.join(
            databaseDirPath,
            databaseNameElementCounter,
        )

        it("setup", async () => {
            await db.sqlite3.remove(databasePath, logMethod)
            await db.sqlite3.create(databasePath, logMethod)
            await db.requests.post(
                databasePath,
                db.queries.createTable(
                    tableElementCounter.name,
                    Object.values(tableElementCounter.columns),
                ),
            )
            await db.requests.post(
                databasePath,
                db.queries.createView(
                    viewElementCounterLeaderboard.name,
                    viewElementCounterLeaderboard.tableName,
                    Object.values(viewElementCounterLeaderboard.columns),
                    viewElementCounterLeaderboard.options,
                ),
                [],
                logMethod,
            )
            const values = [
                ["horst", 42],
                ["ingrid", 69],
            ]
            for (const value of values) {
                const runResult = await db.requests.post(
                    databasePath,
                    db.queries.insert(tableElementCounter.name, [
                        tableElementCounter.columns.userName.name,
                        tableElementCounter.columns.elementCount.name,
                    ]),
                    value,
                    logMethod,
                )
                chai.expect(runResult.changes).to.equal(
                    1,
                    "No change was detected",
                )
                chai.expect(runResult.lastID).to.be.a("number")
            }
            const valuesOnlyName = [["manfred"], ["ursula"], ["herbert"]]
            for (const valueOnlyName of valuesOnlyName) {
                const runResult = await db.requests.post(
                    databasePath,
                    db.queries.insert(tableElementCounter.name, [
                        tableElementCounter.columns.userName.name,
                    ]),
                    valueOnlyName,
                    logMethod,
                )
                chai.expect(runResult.changes).to.equal(
                    1,
                    "No change was detected",
                )
                chai.expect(runResult.lastID).to.be.a("number")
            }

            const rankAlias = viewElementCounterLeaderboard.columns.rank.alias
            if (rankAlias === undefined) {
                throw Error("rank alias exists")
            }

            const getAll = await db.requests.getAll(
                databasePath,
                db.queries.select(viewElementCounterLeaderboard.name, [
                    {
                        alias: "elementCount",
                        columnName:
                            viewElementCounterLeaderboard.columns.elementCount
                                .columnName,
                    },
                    rankAlias,
                    {
                        alias: "userName",
                        columnName:
                            viewElementCounterLeaderboard.columns.userName
                                .columnName,
                    },
                ]),
                [],
                logMethod,
            )
            chai.expect(getAll).to.deep.equal([
                { elementCount: 69, rank: 1, userName: "ingrid" },
                { elementCount: 42, rank: 2, userName: "horst" },
                { elementCount: 0, rank: 3, userName: "herbert" },
                { elementCount: 0, rank: 4, userName: "manfred" },
                { elementCount: 0, rank: 5, userName: "ursula" },
            ])
        }).timeout(githubCiMaxTimeout)
    })
}
