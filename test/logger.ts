// Package imports
import {
    createLogger as createWinstonLogger,
    format,
    transports,
} from "winston"
// Type imports
import type { Logger as WinstonLogger } from "winston"
import { Logger, LogLevel } from "../src/logging"

/**
 * The default log levels of the logger.
 */
enum LoggerLevel {
    DEBUG = "debug",
    ERROR = "error",
    INFO = "info",
    WARN = "warn",
}

/**
 * The information the logger stores.
 */
interface LoggerInformation {
    level: LoggerLevel | string
    message: string
    section?: string
    service?: string
    subsection?: string
    timestamp?: string
}

/**
 * Function that formats the log output.
 *
 * @param logInfo The information the logger provides.
 * @returns Parsed string.
 */
const logFormat = (logInfo: LoggerInformation): string => {
    if (logInfo.timestamp && logInfo.service) {
        if (logInfo.section) {
            if (logInfo.subsection) {
                return `[${logInfo.timestamp}] ${logInfo.service}#${logInfo.section}#${logInfo.subsection} ${logInfo.level}: ${logInfo.message}`
            }
            return `[${logInfo.timestamp}] ${logInfo.service}#${logInfo.section} ${logInfo.level}: ${logInfo.message}`
        }
        return `[${logInfo.timestamp}] ${logInfo.service} ${logInfo.level}: ${logInfo.message}`
    }
    return `${logInfo.level}: ${logInfo.message}`
}

/**
 * Create a global logger.
 *
 * @param name The name of the logger.
 * @param logLevelConsole The log level of the console logger.
 * @returns Logger.
 */
const createConsoleLogger = (
    name: string,
    logLevelConsole: LoggerLevel | string = "info",
): WinstonLogger =>
    createWinstonLogger({
        defaultMeta: { service: name },
        exitOnError: false,
        format: format.combine(format.timestamp(), format.printf(logFormat)),
        transports: [new transports.Console({ level: logLevelConsole })],
    })

export const getTestLogger = (
    testName: string,
    logLevelConsole: LoggerLevel | string = "info",
): WinstonLogger => createConsoleLogger(`Test_${testName}`, logLevelConsole)

export const createLogMethod =
    (logger: WinstonLogger): Logger =>
    (logLevel, logMessage, logSection) =>
        logger.log({
            level: logLevel === LogLevel.SQL ? LogLevel.DEBUG : logLevel,
            message:
                logMessage instanceof Error ? logMessage.message : logMessage,
            section: logSection + (logLevel === LogLevel.SQL ? ":sql" : ""),
        })
