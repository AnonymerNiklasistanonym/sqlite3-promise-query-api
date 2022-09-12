// Package imports
import { describe } from "mocha"
// Local imports
import exampleCounter from "./examples/example_counter.test"

export default (databaseDirPath: string): Mocha.Suite => {
    return describe("examples", () => {
        exampleCounter(databaseDirPath)
    })
}
