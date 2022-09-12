// Local imports
import db from "../../../src/index"
// Type imports
import type { SqliteTable, SqliteView } from "../../../src/index"

export const databaseNameElementCounter = "elementCounter.db"

/** Information about a SQLite table to track an element count for users. */
export const tableElementCounter: SqliteTable<"elementCount" | "userName"> = {
    columns: {
        /** The element counter. */
        elementCount: {
            name: "element_count",
            options: { default: 0, notNull: true },
            type: db.queries.CreateTableColumnType.INTEGER,
        },
        /** The unique user name. */
        userName: {
            name: "user_name",
            options: { notNull: true, primaryKey: true, unique: true },
            type: db.queries.CreateTableColumnType.TEXT,
        },
    },
    name: "element_counter",
} as const

/** Information about a SQLite table (view) for a leaderboard about the counter. */
export const viewElementCounterLeaderboard: SqliteView<
    "elementCount" | "userName" | "rank"
> = {
    columns: {
        elementCount: {
            columnName: tableElementCounter.columns.elementCount.name,
        },
        /** The current rank of the user in the table view sorted by the count. */
        rank: {
            alias: "rank",
            columnName: db.queries.rowNumberOver([
                {
                    ascending: false,
                    column: tableElementCounter.columns.elementCount.name,
                },
                {
                    ascending: true,
                    column: tableElementCounter.columns.userName.name,
                },
            ]),
        },
        userName: {
            columnName: tableElementCounter.columns.userName.name,
        },
    },
    name: "element_counter_leaderboard",
    tableName: tableElementCounter.name,
} as const
