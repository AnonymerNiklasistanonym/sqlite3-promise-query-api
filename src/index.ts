// Local imports
import * as sqlite3 from "./sqlite3"
import * as queries from "./queries"
import * as requests from "./requests"

export { CreateDatabaseErrorCode, ErrorCodeOpen } from "./sqlite3"
export { LogLevel } from "./logging"
export { CreateTableColumnType } from "./queries"

export type { Logger } from "./logging"
export type {
    AlterTableRenameColumn,
    AlterTableOptions,
    CreateTableColumn,
    CreateTableColumnForeign,
    CreateTableColumnOptions,
    ExistsDbOut,
    SelectColumn,
    SelectQueryInnerJoin,
    SelectQueryOptions,
    SelectQueryOrderBy,
    SelectWhereColumn,
    UpdateColumn,
} from "./queries"
export type { OpenDatabaseOptions, SqliteInternalError } from "./sqlite3"
export type { SqliteIndex, SqliteTable, SqliteView } from "./helper"

const sqlite3PromiseQueryApi = {
    queries,
    requests,
    sqlite3,
}

// Typescript default export (import osuApiV2 from "sqlite3PromiseQueryApi")
// NodeJs: (const sqlite3PromiseQueryApi = require("osuApiV2").default)
export default sqlite3PromiseQueryApi
// This is not working:
//// NodeJs compatibility (const sqlite3PromiseQueryApi = require("sqlite3PromiseQueryApi"))
//module.exports = sqlite3PromiseQueryApi
