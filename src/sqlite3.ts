// Package imports
import * as sqlite from "sqlite3"
import { Database } from "sqlite3"
import { promises as fs } from "fs"
// Local imports
import { ErrorCodePostRequest } from "./requests"
import { LogLevel } from "./logging"
// Type imports
import type { Logger } from "./logging"

const sqlite3 = sqlite.verbose()

export enum ErrorCodeOpen {
    SQLITE_CANTOPEN = "SQLITE_CANTOPEN",
}

export interface SqliteInternalError extends Error {
    code: ErrorCodePostRequest | ErrorCodeOpen
}

export interface OpenDatabaseOptions {
    readOnly?: boolean
}

export const open = async (
    dbNamePath: string,
    logger?: Logger,
    options?: OpenDatabaseOptions,
): Promise<Database> => {
    return new Promise((resolve, reject) => {
        if (logger !== undefined) {
            logger(
                LogLevel.DEBUG,
                `Open '${dbNamePath}' (${JSON.stringify(options)})`,
                "open",
            )
        }
        const sqliteOpenMode =
            options !== undefined && options.readOnly
                ? sqlite3.OPEN_READONLY
                : sqlite3.OPEN_READWRITE
        const db = new sqlite3.Database(dbNamePath, sqliteOpenMode, (err) => {
            if (err) {
                if (logger !== undefined) {
                    logger(LogLevel.ERROR, err as Error, "open")
                }
                reject(err)
            } else {
                resolve(db)
            }
        })
    })
}

export enum CreateDatabaseErrorCode {
    SQLITE_MISUSE = "SQLITE_MISUSE",
}

export const create = async (
    dbNamePath: string,
    logger?: Logger,
): Promise<Database> => {
    return new Promise((resolve, reject) => {
        if (logger !== undefined) {
            logger(LogLevel.DEBUG, `Create '${dbNamePath}'`, "create")
        }
        const db = new sqlite3.Database(
            dbNamePath,
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            (err) => {
                if (err) {
                    if (logger !== undefined) {
                        logger(LogLevel.ERROR, err as Error, "create")
                    }
                    reject(err)
                } else {
                    resolve(db)
                }
            },
        )
    })
}

export const remove = async (
    dbNamePath: string,
    logger?: Logger,
): Promise<void> => {
    if (logger !== undefined) {
        logger(LogLevel.DEBUG, `Remove '${dbNamePath}'`, "remove")
    }
    try {
        await fs.access(dbNamePath)
        await fs.unlink(dbNamePath)
    } catch (error) {
        // File does not exist, do nothing
        //logger.warn(error);
    }
    // Sanity check on Windows
    if (await exists(dbNamePath, logger)) {
        const errorStillExists = Error("Database still exists")
        if (logger !== undefined) {
            logger(LogLevel.ERROR, errorStillExists, "remove")
        }
        throw errorStillExists
    }
}

export const exists = async (
    dbNamePath: string,
    logger?: Logger,
): Promise<boolean> => {
    if (logger !== undefined) {
        logger(LogLevel.DEBUG, `Does '${dbNamePath}' exist`, "exists")
    }
    try {
        await fs.access(dbNamePath)
        return true
    } catch (error) {
        // File does not exist
        return false
    }
}
