// Package imports
import { describe } from "mocha"
// Local imports
import databaseSqlite3 from "./core/sqlite3.test"
import databaseQueries from "./core/queries.test"
import databaseRequests from "./core/requests.test"

export default (databaseDirPath: string): Mocha.Suite => {
    return describe("core", () => {
        databaseSqlite3(databaseDirPath)
        databaseQueries()
        databaseRequests(databaseDirPath)
    })
}
