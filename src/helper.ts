// Type imports
import type {
    CreateTableColumn,
    SelectColumn,
    SelectQueryOptions,
} from "./queries"

/** A helper data structure for sqlite tables. */
export interface SqliteTable<COLUMNS extends string = string> {
    /** The columns of the table. */
    columns: Record<COLUMNS, CreateTableColumn>
    /** The name of the table. */
    name: string
}

/** A helper data structure for sqlite views. */
export interface SqliteView<COLUMNS extends string = string> {
    /** The columns of the view. */
    columns: Record<COLUMNS, SelectColumn>
    /** The name of the view. */
    name: string
    /** View options */
    options?: SelectQueryOptions
    /** The name of the table that the view is based on. */
    tableName: string
}
