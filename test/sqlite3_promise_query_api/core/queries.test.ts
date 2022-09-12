/* eslint-disable no-magic-numbers */
import db from "../../../src/index"
import chai from "chai"
import { describe } from "mocha"
// Type imports
import type { CreateTableColumn } from "../../../src/index"

export default (): Mocha.Suite => {
    return describe("database.queries", () => {
        it("create table", () => {
            const columns: CreateTableColumn[] = [
                {
                    name: "blob",
                    type: db.queries.CreateTableColumnType.BLOB,
                },
                {
                    name: "integer",
                    type: db.queries.CreateTableColumnType.INTEGER,
                },
                {
                    name: "numeric",
                    type: db.queries.CreateTableColumnType.NUMERIC,
                },
                {
                    name: "real",
                    type: db.queries.CreateTableColumnType.REAL,
                },
                {
                    name: "text",
                    type: db.queries.CreateTableColumnType.TEXT,
                },
            ]

            const queryCreateTable1 = db.queries.createTable("test", columns)
            chai.expect(queryCreateTable1).to.be.a("string")
            chai.expect(queryCreateTable1.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryCreateTable1).to.deep.equal(
                "CREATE TABLE test " +
                    "(blob BLOB,integer INTEGER,numeric NUMERIC,real REAL,text TEXT);",
            )

            const queryCreateTable2 = db.queries.createTable(
                "test",
                columns,
                true,
            )
            chai.expect(queryCreateTable2).to.be.a("string")
            chai.expect(queryCreateTable2.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryCreateTable2).to.deep.equal(
                "CREATE TABLE IF NOT EXISTS test " +
                    "(blob BLOB,integer INTEGER,numeric NUMERIC,real REAL,text TEXT);",
            )

            const queryCreateTable3 = db.queries.createTable(
                "contact_groups",
                [
                    {
                        foreign: {
                            column: "contact_id",
                            options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                            tableName: "contacts",
                        },
                        name: "contact_id",
                        type: db.queries.CreateTableColumnType.INTEGER,
                    },
                    {
                        foreign: {
                            column: "group_id",
                            options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                            tableName: "groups",
                        },
                        name: "group_id",
                        type: db.queries.CreateTableColumnType.INTEGER,
                    },
                ],
                true,
            )
            chai.expect(queryCreateTable3).to.be.a("string")
            chai.expect(queryCreateTable3.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryCreateTable3).to.deep.equal(
                "CREATE TABLE IF NOT EXISTS contact_groups " +
                    "(contact_id INTEGER,group_id INTEGER," +
                    "FOREIGN KEY (contact_id) REFERENCES contacts (contact_id) ON DELETE CASCADE ON UPDATE NO ACTION," +
                    "FOREIGN KEY (group_id) REFERENCES groups (group_id) ON DELETE CASCADE ON UPDATE NO ACTION);",
            )

            const queryCreateTable4 = db.queries.createTable(
                "table_column_options_test",
                [
                    {
                        name: "integer_with_default",
                        options: { default: 0, notNull: true },
                        type: db.queries.CreateTableColumnType.INTEGER,
                    },
                    {
                        name: "real_with_default",
                        options: { default: 72.934, notNull: true },
                        type: db.queries.CreateTableColumnType.REAL,
                    },
                    {
                        name: "text_with_default",
                        options: { default: "'default'", notNull: true },
                        type: db.queries.CreateTableColumnType.TEXT,
                    },
                    {
                        name: "id",
                        options: {
                            notNull: true,
                            primaryKey: true,
                            unique: true,
                        },
                        type: db.queries.CreateTableColumnType.INTEGER,
                    },
                ],
            )

            chai.expect(queryCreateTable4).to.be.a("string")
            chai.expect(queryCreateTable4.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryCreateTable4).to.deep.equal(
                "CREATE TABLE table_column_options_test " +
                    "(integer_with_default INTEGER NOT NULL DEFAULT 0,real_with_default REAL NOT NULL DEFAULT 72.934,text_with_default TEXT NOT NULL DEFAULT 'default',id INTEGER PRIMARY KEY UNIQUE NOT NULL);",
            )
        })
        it("drop table", () => {
            const queryDropTable1 = db.queries.dropTable("test")
            chai.expect(queryDropTable1).to.be.a("string")
            chai.expect(queryDropTable1.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryDropTable1).to.deep.equal("DROP TABLE test;")

            // TODO Check foreign keys implementation

            const queryDropTable2 = db.queries.dropTable("test", true)
            chai.expect(queryDropTable2).to.be.a("string")
            chai.expect(queryDropTable2.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryDropTable2).to.deep.equal(
                "DROP TABLE IF EXISTS test;",
            )
        })
        it("exists", () => {
            const queryExists1 = db.queries.exists("test")
            chai.expect(queryExists1).to.be.a("string")
            chai.expect(queryExists1.length).to.be.above(0, "Query not empty")
            chai.expect(queryExists1).to.deep.equal(
                "SELECT EXISTS(SELECT 1 FROM test WHERE id=?) AS exists_value;",
            )

            const queryExists2 = db.queries.exists("test", "column")
            chai.expect(queryExists2).to.be.a("string")
            chai.expect(queryExists2.length).to.be.above(0, "Query not empty")
            chai.expect(queryExists2).to.deep.equal(
                "SELECT EXISTS(SELECT 1 FROM test WHERE column=?) AS exists_value;",
            )
        })
        it("insert", () => {
            const queryInsert = db.queries.insert("test", [
                "column1",
                "column2",
            ])
            chai.expect(queryInsert).to.be.a("string")
            chai.expect(queryInsert.length).to.be.above(0, "Query not empty")
            chai.expect(queryInsert).to.deep.equal(
                "INSERT INTO test(column1,column2) VALUES(?,?);",
            )
        })
        it("remove", () => {
            const queryRemove1 = db.queries.remove("test")
            chai.expect(queryRemove1).to.be.a("string")
            chai.expect(queryRemove1.length).to.be.above(0, "Query not empty")
            chai.expect(queryRemove1).to.deep.equal(
                "DELETE FROM test WHERE id=?;",
            )

            const queryRemove2 = db.queries.remove("test", "columnWhere")
            chai.expect(queryRemove2).to.be.a("string")
            chai.expect(queryRemove2.length).to.be.above(0, "Query not empty")
            chai.expect(queryRemove2).to.deep.equal(
                "DELETE FROM test WHERE columnWhere=?;",
            )
        })
        it("select", () => {
            const querySelect1 = db.queries.select("test", ["a", "b", "c"])
            chai.expect(querySelect1).to.be.a("string")
            chai.expect(querySelect1.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect1).to.deep.equal("SELECT a,b,c FROM test;")

            const querySelect2 = db.queries.select("test", ["a", "b", "c"], {
                whereColumn: "id",
            })
            chai.expect(querySelect2).to.be.a("string")
            chai.expect(querySelect2.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect2).to.deep.equal(
                "SELECT a,b,c FROM test WHERE id=?;",
            )

            const querySelect3 = db.queries.select("test", ["a", "b", "c"], {
                whereColumn: { columnName: "id", tableName: "test" },
            })
            chai.expect(querySelect3).to.be.a("string")
            chai.expect(querySelect3.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect3).to.deep.equal(
                "SELECT a,b,c FROM test WHERE test.id=?;",
            )

            const querySelect4 = db.queries.select("test", ["a", "b", "c"], {
                innerJoins: [
                    {
                        otherColumn: "other_id",
                        otherTableName: "other_test",
                        thisColumn: "id",
                    },
                ],
                whereColumn: { columnName: "id", tableName: "test" },
            })
            chai.expect(querySelect4).to.be.a("string")
            chai.expect(querySelect4.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect4).to.deep.equal(
                "SELECT a,b,c FROM test INNER JOIN other_test ON other_test.other_id=id WHERE test.id=?;",
            )

            const querySelect5 = db.queries.select("test", ["a", "b", "c"], {
                innerJoins: [
                    {
                        otherColumn: "other_id",
                        otherTableName: "other_test",
                        thisColumn: "id",
                    },
                ],
                limit: 10,
                offset: 2,
                whereColumn: { columnName: "id", tableName: "test" },
            })
            chai.expect(querySelect5).to.be.a("string")
            chai.expect(querySelect5.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect5).to.deep.equal(
                "SELECT a,b,c FROM test INNER JOIN other_test ON other_test.other_id=id WHERE test.id=? LIMIT 10 OFFSET 2;",
            )

            // TODO Check all select query options
        })
        it("update", () => {
            const queryUpdate1 = db.queries.update("test", ["a", "b", "c"])
            chai.expect(queryUpdate1).to.be.a("string")
            chai.expect(queryUpdate1.length).to.be.above(0, "Query not empty")
            chai.expect(queryUpdate1).to.deep.equal(
                "UPDATE test SET a=?,b=?,c=? WHERE id=?;",
            )

            const queryUpdate2 = db.queries.update(
                "test",
                ["a", "b", "c"],
                "whereColumn",
            )
            chai.expect(queryUpdate2).to.be.a("string")
            chai.expect(queryUpdate2.length).to.be.above(0, "Query not empty")
            chai.expect(queryUpdate2).to.deep.equal(
                "UPDATE test SET a=?,b=?,c=? WHERE whereColumn=?;",
            )
        })
    })
}
