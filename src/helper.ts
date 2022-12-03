// Type imports
import type {
    CreateTableColumn,
    SelectColumn,
    SelectQueryOptions,
    SelectWhereColumn,
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

/** A helper data structure for sqlite indices. */
export interface SqliteIndex {
    /** The columns of the index. */
    columns: string[]
    /** The name of the index. */
    name: string
    /** The name of the table that the index is based on. */
    tableName: string
    /** Additional index options. */
    where?: SelectWhereColumn
}
