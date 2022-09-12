// Logger independent logger interface

/**
 * The log levels of the internal logger.
 */
export enum LogLevel {
    SQL = "sql",
    DEBUG = "debug",
    ERROR = "error",
    INFO = "info",
    WARN = "warn",
}

export type Logger = (
    logLevel: LogLevel,
    logMessage: string | Error,
    logSection: string,
) => void
