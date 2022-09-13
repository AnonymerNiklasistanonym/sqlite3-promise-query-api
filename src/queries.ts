/**
 * Create `DELETE` query.
 *
 * @param tableName Sanitized table name.
 * @param whereColumns Sanitized column on which value a row should be
 * removed.
 * @returns SQLite query.
 * @example
 * ```sql
 * DELETE FROM tableName: string WHERE whereColumn=?;
 * ```
 */
export const remove = (
    tableName: string,
    whereColumns: SelectWhereColumn = { columnName: "id" },
): string => {
    return `DELETE FROM ${tableName} ${where(whereColumns)};`
}

/**
 * Create `INSERT INTO` query.
 *
 * @param tableName Sanitized table name.
 * @param columnNames Sanitized column names that should be overwritten with
 * new values.
 * @returns SQLite query.
 * @example
 * ```sql
 * INSERT INTO tableName: string(column_0, column_i, column_n) VALUES(?, ?, ?);
 * ```
 */
export const insert = (tableName: string, columnNames: string[]): string => {
    return (
        `INSERT INTO ${tableName}(${columnNames.join(",")}) ` +
        `VALUES(${columnNames.map(() => "?").join(",")});`
    )
}

export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

/**
 * Create `EXISTS` query.
 *
 * @param tableName Sanitized table name.
 * @param whereColumns Sanitized column name which is checked for existing
 * with query value.
 * @returns SQLite query.
 * @example
 * ```sql
 * SELECT EXISTS(SELECT 1 FROM tableName: string WHERE column=? AS exists_value;
 * ```
 */
export const exists = (
    tableName: string,
    whereColumns: SelectWhereColumn = { columnName: "id" },
): string => {
    return `SELECT EXISTS(SELECT 1 FROM ${tableName} ${where(
        whereColumns,
    )}) AS exists_value;`
}

export interface SelectQueryInnerJoin {
    /**
     * Name of linked column of linked table.
     */
    otherColumn: string
    /**
     * Name of linked table.
     */
    otherTableName: string
    /**
     * Name of column that it should be linked to.
     */
    thisColumn: string
}

/**
 * Order by interface for select queries.
 *
 * @example
 * ```sql
 * ORDER BY
 * column_1 ASC,
 * column_2 DESC;
 * ```
 */
export interface SelectQueryOrderBy {
    /**
     * True if ascending sort, false if descending.
     */
    ascending: boolean
    /**
     * Name of the column that should be sorted.
     */
    column: string
    /**
     * Name of the table of the column.
     */
    tableName?: string
}

export interface SelectQueryOptions {
    /**
     * Inner join descriptions.
     */
    innerJoins?: SelectQueryInnerJoin[]
    limit?: number
    limitOffset?: number
    /**
     * Additionally order the results by some columns.
     */
    orderBy?: SelectQueryOrderBy[]
    /**
     * Only get back unique results.
     */
    unique?: boolean
    /**
     * Describe a specification of which value a row needs to have to be included
     * `WHERE column=?`/`WHERE columnA=? OR columnB=?`.
     */
    whereColumns?: SelectWhereColumn
}

export interface SelectColumn {
    alias?: string
    columnName: string
    tableName?: string
}

/**
 * Create a row number over column that can for example be used in table view.
 *
 * @param orderBy columns that should be used to determine the row number
 * @returns SQLite query.
 * @example
 * ```sql
 * ROW_NUMBER () OVER () as rank
 * ```
 * @example
 * ```sql
 * ROW_NUMBER () OVER (ORDER BY name DESC) as rank
 * ```
 */
export const rowNumberOver = (orderByElements: SelectQueryOrderBy[]) => {
    return `ROW_NUMBER () OVER (${orderBy(orderByElements)})`
}

export interface SelectWhereColumn {
    and?: SelectWhereColumn | SelectWhereColumn[]
    columnName: string
    tableName?: string
    operation?: "!=" | "=" | ">=" | "<=" | "<" | ">"
    or?: SelectWhereColumn | SelectWhereColumn[]
}

const whereHelper = (whereOption: SelectWhereColumn): string => {
    let whereStr = `${
        whereOption.tableName !== undefined ? `${whereOption.tableName}.` : ""
    }${whereOption.columnName}${
        whereOption.operation !== undefined ? whereOption.operation : "="
    }?`
    if (Array.isArray(whereOption.and) && whereOption.and.length > 0) {
        whereStr = `(${[whereStr, ...whereOption.and.map(whereHelper)].join(
            " AND ",
        )})`
    }
    if (!Array.isArray(whereOption.and) && whereOption.and !== undefined) {
        whereStr = `(${[whereStr, whereHelper(whereOption.and)].join(" AND ")})`
    }
    if (Array.isArray(whereOption.or) && whereOption.or.length > 0) {
        whereStr = `(${[whereStr, ...whereOption.or.map(whereHelper)].join(
            " OR ",
        )})`
    }
    if (!Array.isArray(whereOption.or) && whereOption.or !== undefined) {
        whereStr = `(${[whereStr, whereHelper(whereOption.or)].join(" OR ")})`
    }
    return whereStr
}

export const where = (whereOption: SelectWhereColumn) => {
    const whereStr = whereHelper(whereOption)
    return `WHERE ${whereStr}`
}

export const orderBy = (orderBy: SelectQueryOrderBy[]) => {
    let orderByStr = ""
    if (orderBy.length > 0) {
        orderByStr =
            "ORDER BY " +
            orderBy.map(
                (a) =>
                    `${a.tableName !== undefined ? `${a.tableName}.` : ""}${
                        a.column
                    } ${a.ascending ? "ASC" : "DESC"}`,
            )
    }
    return orderByStr
}

/**
 * Create `SELECT` query.
 *
 * @param tableName Name of the table where values should be inserted.
 * @param columns Name of the columns where values should be inserted.
 * @param options Select options.
 * @returns SQLite query.
 * @example
 * ```sql
 * SELECT column_0, column_i, column_n FROM tableName: string;
 * SELECT column_i FROM tableName: string WHERE whereColumn=?;
 * SELECT column FROM table INNER JOIN otherTable_i ON otherCol_i=thisCol_i;
 * SELECT DISTINCT column_0 FROM tableName: string;
 * SELECT column_0 FROM tableName: string ORDER BY column_0 ASC;
 * ```
 */
export const select = (
    tableName: string,
    columns: (string | SelectColumn)[],
    options?: SelectQueryOptions,
): string => {
    let innerJoinsStr = ""
    let whereStr = ""
    let orderStr = ""
    let uniqueStr = ""
    let limitStr = ""
    if (options) {
        if (options.unique) {
            uniqueStr = "DISTINCT "
        }
        if (options.innerJoins) {
            innerJoinsStr = options.innerJoins
                .map(
                    (a) =>
                        `INNER JOIN ${a.otherTableName} ON ${a.otherTableName}.${a.otherColumn}=${a.thisColumn}`,
                )
                .join(" ")
        }
        if (options.whereColumns) {
            whereStr = where(options.whereColumns)
        }
        if (options.orderBy) {
            orderStr = orderBy(options.orderBy)
        }
        if (options.limit) {
            limitStr = `LIMIT ${options.limit}`
            if (options.limitOffset) {
                limitStr += ` OFFSET ${options.limitOffset}`
            }
        }
    }
    const columnStrings = columns.reduce(
        (previousVal: string[], currentValue) => {
            if (typeof currentValue === "string") {
                return previousVal.concat(currentValue)
            }
            let columnEntry = ""
            if (currentValue.tableName) {
                columnEntry += `${currentValue.tableName}.`
            }
            columnEntry += currentValue.columnName
            if (currentValue.alias) {
                columnEntry += ` AS ${currentValue.alias}`
            }
            return previousVal.concat(columnEntry)
        },
        [],
    )
    return (
        `SELECT ${uniqueStr}${columnStrings.join(",")} ` +
        `FROM ${tableName}${[innerJoinsStr, whereStr, orderStr, limitStr]
            .filter((a) => a.length > 0)
            .map((a) => ` ${a}`)
            .join("")};`
    )
}

/**
 * Enum for table column types.
 *
 * <table><tr><th>Expression Affinity</th><th>Column Declared Type</th>
 * </tr><tr><td>TEXT                       </td><td>"TEXT"
 * </td></tr><tr><td>NUMERIC               </td><td>"NUM"
 * </td></tr><tr><td>INTEGER               </td><td>"INT"
 * </td></tr><tr><td>REAL                  </td><td>"REAL"
 * </td></tr><tr><td>BLOB (a.k.a "NONE")   </td><td>"" (empty string)
 * </td></tr></table>
 * Source: {@link https://www.sqlite.org/lang_createtable.html}.
 */
export enum CreateTableColumnType {
    BLOB = "BLOB",
    INTEGER = "INTEGER",
    NUMERIC = "NUMERIC",
    REAL = "REAL",
    TEXT = "TEXT",
}

export interface CreateTableColumnOptions {
    /**
     * A default value for the column.
     * (if not set the global default is always NULL)
     *
     * ```sql
     * CREATE TABLE Products(
     *      ProductId INTEGER PRIMARY KEY,
     *      Price DEFAULT 0.00,
     *      DateInserted DEFAULT CURRENT_TIMESTAMP,
     *      Entered DEFAULT (round(julianday('now'))),
     *      Deadline  DEFAULT (round(julianday('now')) + 10.5)
     * );
     * ```
     */
    default?: string | number
    /**
     * The value of the column can never be NULL.
     */
    notNull?: boolean
    /**
     * The value of the column is the primary key of the table.
     */
    primaryKey?: boolean
    /**
     * The value must be unique for all rows in this column.
     */
    unique?: boolean
}

/**
 * Information about a SQLite table column.
 */
export interface CreateTableColumn {
    /**
     * Foreign key options.
     */
    foreign?: CreateTableColumnForeign
    /**
     * Column name.
     */
    name: string
    /**
     * Column options (`NOT NULL`, `UNIQUE`, `PRIMARY KEY`).
     */
    options?: CreateTableColumnOptions
    /**
     * Column type (`INTEGER`, `TEXT`).
     */
    type: CreateTableColumnType
}

export interface CreateTableColumnForeign {
    /**
     * Foreign key table column name.
     */
    column: string
    /**
     * Options for foreign key (`ON DELETE CASCADE ON UPDATE NO ACTION`).
     */
    options?: string[]
    /**
     * Foreign key table name.
     */
    tableName: string
}

/**
 * Create database table.
 *
 * @param tableName The name of the table.
 * @param columns The columns of the table.
 * @param ifNotExists Create table if not already existing.
 * @returns SQLite query.
 * @example
 * ```sql
 * CREATE TABLE IF NOT EXISTS contacts (
 * contact_id INTEGER PRIMARY KEY,
 * first_name TEXT NOT NULL,
 * last_name TEXT NOT NULL,
 * email text NOT NULL UNIQUE,
 * phone text NOT NULL UNIQUE
 * );
 * ```
 */
export const createTable = (
    tableName: string,
    columns: CreateTableColumn[],
    ifNotExists = false,
): string => {
    const columnOptionsToString = (
        columnOptions?: CreateTableColumnOptions,
    ): string => {
        const columnOptionsArray = []
        if (columnOptions) {
            if (columnOptions.primaryKey) {
                columnOptionsArray.push("PRIMARY KEY")
            }
            if (columnOptions.unique) {
                columnOptionsArray.push("UNIQUE")
            }
            if (columnOptions.notNull) {
                columnOptionsArray.push("NOT NULL")
            }
            if (columnOptions.default !== undefined) {
                columnOptionsArray.push(`DEFAULT ${columnOptions.default}`)
            }
        }
        if (columnOptionsArray.length === 0) {
            return ""
        } else {
            return " " + columnOptionsArray.join(" ")
        }
    }
    const columnsString = columns
        .map((column) => {
            return (
                `${column.name} ${column.type}` +
                `${columnOptionsToString(column.options)}`
            )
        })
        .join(",")
    const foreignKeysString = columns
        .filter((column) => column.foreign !== undefined)
        .map((column) => {
            const foreign = column.foreign as CreateTableColumnForeign
            return (
                `FOREIGN KEY (${column.name}) REFERENCES ${foreign.tableName} (${foreign.column})` +
                (foreign.options !== undefined && foreign.options.length > 0
                    ? " " + foreign.options.join(" ")
                    : "")
            )
        })
    const foreignKeysStringFinal =
        foreignKeysString.length > 0 ? "," + foreignKeysString.join(",") : ""
    return (
        `CREATE TABLE ${ifNotExists ? "IF NOT EXISTS " : ""}${tableName} (` +
        `${columnsString}${foreignKeysStringFinal});`
    )
}

/**
 * Delete a database table.
 *
 * @param tableName Name of the table to delete.
 * @param ifExists Only remove table if it exists.
 * @returns SQLite query.
 * @example
 * ```sql
 * DROP TABLE contacts;
 * DROP TABLE IF EXISTS contacts;
 * ```
 */
export const dropTable = (tableName: string, ifExists = false): string => {
    return `DROP TABLE ${ifExists ? "IF EXISTS " : ""}${tableName};`
}

/**
 * Create database view.
 *
 * @param viewName Name of the view to create.
 * @param tableName Name of the table that the view is based on.
 * @param columns View columns.
 * @param options View creation options.
 * @param ifNotExists Create view if not already existing.
 * @returns SQLite query.
 * @example
 * ```sql
 * CREATE VIEW IF NOT EXISTS leaderboard
 * AS
 * SELECT
 *     contacts.count,
 *     contacts.name
 * FROM
 *     contacts
 * ORDER BY
 *     contacts.count DESC
 * );
 * ```
 */
export const createView = (
    viewName: string,
    tableName: string,
    columns: (string | SelectColumn)[],
    options?: SelectQueryOptions,
    ifNotExists = false,
): string => {
    return (
        `CREATE VIEW ${ifNotExists ? "IF NOT EXISTS " : ""}${viewName} AS ` +
        `${select(tableName, columns, options)}`
    )
}

/**
 * Delete a database view.
 *
 * @param viewName Name of the view to delete.
 * @param ifExists Only remove view if it exists.
 * @returns SQLite query.
 * @example
 * ```sql
 * DROP VIEW leaderboard;
 * DROP VIEW IF EXISTS leaderboard;
 * ```
 */
export const dropView = (viewName: string, ifExists = false): string => {
    return `DROP VIEW ${ifExists ? "IF EXISTS " : ""}${viewName};`
}

/**
 * Update database table row values.
 *
 * @param tableName Name of the table.
 * @param values Values that should be updated.
 * @param whereColumns Column where the row changes should be made.
 * @returns SQLite query.
 * @example
 * ```sql
 * UPDATE employees
 * SET lastname = 'Smith', firstname = 'Jo'
 * WHERE
 * employeeid = 3
 * ```
 */
export const update = (
    tableName: string,
    values: string[],
    whereColumns: SelectWhereColumn = { columnName: "id" },
): string => {
    const setString = values.map((value) => `${value}=?`).join(",")
    return `UPDATE ${tableName} SET ${setString} ${where(whereColumns)};`
}
