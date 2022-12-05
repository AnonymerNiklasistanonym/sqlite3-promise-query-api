// Package imports
import { open } from "./sqlite3"
// Type imports
import type { RunResult } from "sqlite3"
import type { SqliteInternalError } from "./sqlite3"
import { Logger, LogLevel } from "./logging"

/**
 * List of errors that can happen during a post request.
 */
export enum ErrorCodePostRequest {
    /** Some column specification/constraint was violated. */
    SQLITE_CONSTRAINT = "SQLITE_CONSTRAINT",
    /** Hard query error like a duplicated column or non existing column. */
    SQLITE_ERROR = "SQLITE_ERROR",
}

/**
 * Check if an error is a database error.
 *
 * @param error A possible database error.
 * @returns True if database error.
 */
export const isDatabaseError = (error: unknown): boolean => {
    if (
        error !== undefined &&
        (error as SqliteInternalError).code !== undefined
    ) {
        if (
            (error as SqliteInternalError).code ===
            ErrorCodePostRequest.SQLITE_CONSTRAINT
        ) {
            return true
        }
        if (
            (error as SqliteInternalError).code ===
            ErrorCodePostRequest.SQLITE_ERROR
        ) {
            return true
        }
    }
    return false
}

/**
 * Get one result from the database.
 *
 * @param databasePath Path to database.
 * @param query The database query that should be run.
 * @param parameters Optional values that are inserted for query `?` symbols.
 * @param logger Logger (used for logging).
 * @returns Either undefined when no result or the found result.
 */
// Disable eslint warning because never/unknown make it impossible to use types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEach = async <DB_OUT extends Record<string, any>>(
    databasePath: string,
    query: string,
    parameters: Readonly<(string | number)[]> = [],
    logger?: Logger,
): Promise<DB_OUT | undefined> => {
    if (logger !== undefined) {
        logger(LogLevel.DEBUG, `Run query: '${query}'`, "getEach")
    }
    const db = await open(databasePath, logger, { readOnly: true })
    let requestedElement: DB_OUT
    return new Promise((resolve, reject) =>
        db
            .on("trace", (sql) => {
                if (logger !== undefined) {
                    logger(LogLevel.DEBUG, sql, "getEach")
                }
            })
            .each(
                query,
                parameters,
                (err, row) => {
                    if (err) {
                        if (logger !== undefined) {
                            logger(
                                LogLevel.ERROR,
                                Error(`Database error row: ${err.message}`),
                                "getEach",
                            )
                        }
                        reject(err)
                    } else {
                        requestedElement = row as DB_OUT
                    }
                },
                (err) => {
                    if (err) {
                        if (logger !== undefined) {
                            logger(
                                LogLevel.ERROR,
                                Error(`Database error: ${err.message}`),
                                "getEach",
                            )
                        }
                    }
                    db.close((errClose) => {
                        if (errClose && logger !== undefined) {
                            logger(
                                LogLevel.ERROR,
                                Error(
                                    `Database error close: ${errClose.message}`,
                                ),
                                "getEach",
                            )
                        }
                        if (err || errClose) {
                            return reject(err ? err : errClose)
                        }
                        if (logger !== undefined) {
                            logger(
                                LogLevel.DEBUG,
                                `Run result: '${JSON.stringify(
                                    requestedElement,
                                )}'`,
                                "getEach",
                            )
                        }
                        resolve(requestedElement)
                    })
                },
            ),
    )
}

/**
 * Get a list of results from the database.
 *
 * @param databasePath Path to database.
 * @param query The database query that should be run.
 * @param parameters Optional values that are inserted for query `?` symbols.
 * @param logger Logger (used for logging).
 * @returns Either an empty list when no result or the found results.
 */
// Disable eslint warning because never/unknown make it impossible to use types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAll = async <DB_OUT extends Record<string, any>>(
    databasePath: string,
    query: string,
    parameters: Readonly<(string | number)[]> = [],
    logger?: Logger,
): Promise<DB_OUT[]> => {
    if (logger !== undefined) {
        logger(LogLevel.DEBUG, `Run query: '${query}'`, "getAll")
    }
    const db = await open(databasePath, logger, { readOnly: true })
    return new Promise((resolve, reject) =>
        db
            .on("trace", (sql) => {
                if (logger !== undefined) {
                    logger(LogLevel.DEBUG, sql, "getAll")
                }
            })
            .all(query, parameters, (err, rows) => {
                if (err && logger !== undefined) {
                    logger(
                        LogLevel.ERROR,
                        Error(`Database error: ${err.message}`),
                        "getAll",
                    )
                }
                db.close((errClose) => {
                    if (errClose && logger !== undefined) {
                        logger(
                            LogLevel.ERROR,
                            Error(`Database error close: ${errClose.message}`),
                            "getAll",
                        )
                    }
                    if (err || errClose) {
                        return reject(err ? err : errClose)
                    }
                    if (logger !== undefined) {
                        logger(
                            LogLevel.DEBUG,
                            `Run result: '${JSON.stringify(rows)}'`,
                            "getAll",
                        )
                    }
                    resolve(rows)
                })
            }),
    )
}

/**
 * Update something in database.
 *
 * @param databasePath Path to database.
 * @param query The database query that should be run.
 * @param parameters Optional values that are inserted for query `?` symbols.
 * @param logger Logger (used for logging).
 * @returns Database update info.
 */
export const post = async (
    databasePath: string,
    query: string,
    parameters: Readonly<(string | number)[]> = [],
    logger?: Logger,
): Promise<RunResult> => {
    if (logger !== undefined) {
        logger(LogLevel.DEBUG, `Run query: '${query}'`, "post")
    }
    const db = await open(databasePath, logger)
    return new Promise((resolve, reject) =>
        db
            .on("trace", (sql) => {
                if (logger !== undefined) {
                    logger(LogLevel.SQL, sql, "post")
                }
            })
            .run(query, parameters, function (err) {
                if (err && logger !== undefined) {
                    logger(
                        LogLevel.ERROR,
                        Error(`Database error: ${err.message}`),
                        "post",
                    )
                }
                db.close((errClose) => {
                    if (errClose && logger !== undefined) {
                        logger(
                            LogLevel.ERROR,
                            Error(`Database error close: ${errClose.message}`),
                            "post",
                        )
                    }
                    if (err || errClose) {
                        return reject(err ? err : errClose)
                    }
                    if (logger !== undefined) {
                        logger(
                            LogLevel.DEBUG,
                            `Post Result: '${JSON.stringify(this)}'`,
                            "post",
                        )
                    }
                    resolve(this)
                })
            }),
    )
}
