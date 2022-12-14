/* eslint-disable no-magic-numbers */
import db, { SelectColumn } from "../../../src/index"
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
                        options: { primaryKey: true },
                        type: db.queries.CreateTableColumnType.INTEGER,
                    },
                    {
                        foreign: {
                            column: "group_id",
                            options: [],
                            tableName: "groups",
                        },
                        name: "group_id",
                        type: db.queries.CreateTableColumnType.INTEGER,
                    },
                    {
                        foreign: {
                            column: "group_id",
                            tableName: "groups",
                        },
                        name: "group_id_2",
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
                    "(contact_id INTEGER,group_id INTEGER,group_id_2 INTEGER,PRIMARY KEY (contact_id)," +
                    "FOREIGN KEY (contact_id) REFERENCES contacts (contact_id) ON DELETE CASCADE ON UPDATE NO ACTION," +
                    "FOREIGN KEY (group_id) REFERENCES groups (group_id)," +
                    "FOREIGN KEY (group_id_2) REFERENCES groups (group_id));",
            )

            const queryCreateTable4 = db.queries.createTable(
                "table_column_options_test",
                [
                    {
                        name: "integer_with_default",
                        options: { default: 0, notNull: false },
                        type: db.queries.CreateTableColumnType.INTEGER,
                    },
                    {
                        name: "real_with_default",
                        options: { default: 72.934, notNull: true },
                        type: db.queries.CreateTableColumnType.REAL,
                    },
                    {
                        name: "text_with_default",
                        options: {
                            default: "'default'",
                            notNull: true,
                            primaryKey: true,
                        },
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
                    "(integer_with_default INTEGER DEFAULT 0,real_with_default REAL NOT NULL DEFAULT 72.934,text_with_default TEXT NOT NULL DEFAULT 'default',id INTEGER UNIQUE NOT NULL,PRIMARY KEY (text_with_default,id));",
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
        it("alter table", () => {
            const queryAlterTable1 = db.queries.alterTable("test", {
                addColumn: {
                    name: "new_property",
                    options: {
                        default: 42,
                        notNull: true,
                    },
                    type: db.queries.CreateTableColumnType.INTEGER,
                },
            })
            chai.expect(queryAlterTable1).to.be.a("string")
            chai.expect(queryAlterTable1.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryAlterTable1).to.deep.equal(
                "ALTER TABLE test ADD COLUMN new_property INTEGER NOT NULL DEFAULT 42;",
            )

            const queryAlterTable2 = db.queries.alterTable("test", {
                newTableName: "test_old",
            })
            chai.expect(queryAlterTable2).to.be.a("string")
            chai.expect(queryAlterTable2.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryAlterTable2).to.deep.equal(
                "ALTER TABLE test RENAME TO test_old;",
            )

            const queryAlterTable3 = db.queries.alterTable("test", {
                dropColumnName: "property",
            })
            chai.expect(queryAlterTable3).to.be.a("string")
            chai.expect(queryAlterTable3.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryAlterTable3).to.deep.equal(
                "ALTER TABLE test DROP COLUMN property;",
            )

            const queryAlterTable4 = db.queries.alterTable("test", {
                renameColumn: {
                    columnName: "property",
                    newColumnName: "new_property",
                },
            })
            chai.expect(queryAlterTable4).to.be.a("string")
            chai.expect(queryAlterTable4.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryAlterTable4).to.deep.equal(
                "ALTER TABLE test RENAME COLUMN property TO new_property;",
            )
        })
        it("create view", () => {
            const columns: SelectColumn[] = [
                {
                    columnName: "userId",
                },
                {
                    alias: "rank",
                    columnName: db.queries.rowNumberOver([
                        {
                            ascending: false,
                            column: "elementCount",
                        },
                        {
                            ascending: true,
                            column: "userName",
                        },
                    ]),
                },
            ]

            const queryCreateTable1 = db.queries.createView(
                "test_view",
                "test",
                columns,
                undefined,
                true,
            )
            chai.expect(queryCreateTable1).to.be.a("string")
            chai.expect(queryCreateTable1.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryCreateTable1).to.deep.equal(
                "CREATE VIEW IF NOT EXISTS test_view AS " +
                    "SELECT userId,ROW_NUMBER () OVER (ORDER BY elementCount DESC,userName ASC) AS rank FROM test;",
            )
        })
        it("drop view", () => {
            const queryDropView1 = db.queries.dropView("test")
            chai.expect(queryDropView1).to.be.a("string")
            chai.expect(queryDropView1.length).to.be.above(0, "Query not empty")
            chai.expect(queryDropView1).to.deep.equal("DROP VIEW test;")

            const queryDropView2 = db.queries.dropView("test", true)
            chai.expect(queryDropView2).to.be.a("string")
            chai.expect(queryDropView2.length).to.be.above(0, "Query not empty")
            chai.expect(queryDropView2).to.deep.equal(
                "DROP VIEW IF EXISTS test;",
            )
        })
        it("exists", () => {
            const queryExists1 = db.queries.exists("test")
            chai.expect(queryExists1).to.be.a("string")
            chai.expect(queryExists1.length).to.be.above(0, "Query not empty")
            chai.expect(queryExists1).to.deep.equal(
                "SELECT EXISTS(SELECT 1 FROM test WHERE id=?) AS exists_value;",
            )

            const queryExists2 = db.queries.exists("test", {
                columnName: "column",
            })
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

            const queryRemove2 = db.queries.remove("test", {
                columnName: "columnWhere",
            })
            chai.expect(queryRemove2).to.be.a("string")
            chai.expect(queryRemove2.length).to.be.above(0, "Query not empty")
            chai.expect(queryRemove2).to.deep.equal(
                "DELETE FROM test WHERE columnWhere=?;",
            )

            const queryRemove3 = db.queries.remove("test", {
                and: { columnName: "columnWhere2" },
                columnName: "columnWhere",
            })
            chai.expect(queryRemove3).to.be.a("string")
            chai.expect(queryRemove3.length).to.be.above(0, "Query not empty")
            chai.expect(queryRemove3).to.deep.equal(
                "DELETE FROM test WHERE (columnWhere=? AND columnWhere2=?);",
            )

            const queryRemove4 = db.queries.remove("test", {
                columnName: "columnWhere",
                operation: "=",
                or: {
                    and: [
                        {
                            columnName: "columnWhere3",
                            operation: ">",
                            or: [
                                {
                                    columnName: "columnWhere31",
                                    operation: ">=",
                                },
                                {
                                    columnName: "columnWhere32",
                                    operation: "<=",
                                },
                            ],
                        },
                        {
                            columnName: "columnWhere4",
                            operation: "<",
                        },
                    ],
                    columnName: "columnWhere2",
                    operation: "!=",
                },
            })
            chai.expect(queryRemove4).to.be.a("string")
            chai.expect(queryRemove4.length).to.be.above(0, "Query not empty")
            chai.expect(queryRemove4).to.deep.equal(
                "DELETE FROM test WHERE (columnWhere=? OR (columnWhere2!=? AND (columnWhere3>? OR columnWhere31>=? OR columnWhere32<=?) AND columnWhere4<?));",
            )
        })
        it("select", () => {
            const querySelect1 = db.queries.select("test", ["a", "b", "c"])
            chai.expect(querySelect1).to.be.a("string")
            chai.expect(querySelect1.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect1).to.deep.equal("SELECT a,b,c FROM test;")

            const querySelect2 = db.queries.select("test", ["a", "b", "c"], {
                whereColumns: { columnName: "id" },
            })
            chai.expect(querySelect2).to.be.a("string")
            chai.expect(querySelect2.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect2).to.deep.equal(
                "SELECT a,b,c FROM test WHERE id=?;",
            )

            const querySelect3 = db.queries.select("test", ["a", "b", "c"], {
                whereColumns: { columnName: "id", tableName: "test" },
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
                whereColumns: { columnName: "id", tableName: "test" },
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
                whereColumns: {
                    columnName: "id",
                    lower: true,
                    tableName: "test",
                },
            })
            chai.expect(querySelect5).to.be.a("string")
            chai.expect(querySelect5.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect5).to.deep.equal(
                "SELECT a,b,c FROM test INNER JOIN other_test ON other_test.other_id=id WHERE lower(test.id)=? LIMIT 10;",
            )

            const querySelect6 = db.queries.select(
                "test",
                [{ columnName: "a", tableName: "test" }],
                {
                    limitOffset: 0,
                    orderBy: [
                        {
                            ascending: true,
                            column: "b",
                        },
                        {
                            ascending: false,
                            column: "c",
                            tableName: "test",
                        },
                    ],
                    unique: true,
                },
            )
            chai.expect(querySelect6).to.be.a("string")
            chai.expect(querySelect6.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect6).to.deep.equal(
                "SELECT DISTINCT test.a FROM test ORDER BY b ASC,test.c DESC;",
            )

            const querySelect7 = db.queries.select("test", ["*"], {
                limit: 20,
                limitOffset: 10,
                orderBy: [],
            })
            chai.expect(querySelect7).to.be.a("string")
            chai.expect(querySelect7.length).to.be.above(0, "Query not empty")
            chai.expect(querySelect7).to.deep.equal(
                "SELECT * FROM test LIMIT 20 OFFSET 10;",
            )
        })
        it("update", () => {
            const queryUpdate1 = db.queries.update("test", ["a", "b", "c"])
            chai.expect(queryUpdate1).to.be.a("string")
            chai.expect(queryUpdate1.length).to.be.above(0, "Query not empty")
            chai.expect(queryUpdate1).to.deep.equal(
                "UPDATE test SET a=?,b=?,c=? WHERE id=?;",
            )

            const queryUpdate2 = db.queries.update("test", ["a", "b", "c"], {
                columnName: "whereColumn",
                upper: true,
            })
            chai.expect(queryUpdate2).to.be.a("string")
            chai.expect(queryUpdate2.length).to.be.above(0, "Query not empty")
            chai.expect(queryUpdate2).to.deep.equal(
                "UPDATE test SET a=?,b=?,c=? WHERE upper(whereColumn)=?;",
            )

            const queryUpdate3 = db.queries.update(
                "test",
                [
                    "a",
                    {
                        columnName: "b",
                        operator: "+=",
                    },
                    {
                        columnName: "c",
                        operator: "-=",
                    },
                ],
                {
                    columnName: "whereColumn",
                },
            )
            chai.expect(queryUpdate3).to.be.a("string")
            chai.expect(queryUpdate3.length).to.be.above(0, "Query not empty")
            chai.expect(queryUpdate3).to.deep.equal(
                "UPDATE test SET a=?,b=b+?,c=c-? WHERE whereColumn=?;",
            )

            const queryUpdate4 = db.queries.update(
                "test",
                [
                    "a",
                    {
                        columnName: "b",
                    },
                ],
                {
                    columnName: "whereColumn",
                },
            )
            chai.expect(queryUpdate4).to.be.a("string")
            chai.expect(queryUpdate4.length).to.be.above(0, "Query not empty")
            chai.expect(queryUpdate4).to.deep.equal(
                "UPDATE test SET a=?,b=? WHERE whereColumn=?;",
            )
        })
        it("createIndex", () => {
            const queryCreateIndex1 = db.queries.createIndex(
                "test",
                "test_table",
                ["a", "b", "c"],
            )
            chai.expect(queryCreateIndex1).to.be.a("string")
            chai.expect(queryCreateIndex1.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryCreateIndex1).to.deep.equal(
                "CREATE INDEX test ON test_table (a,b,c);",
            )

            const queryCreateIndex2 = db.queries.createIndex(
                "test",
                "test_table",
                ["count"],
                true,
                {
                    columnName: "count",
                    operation: ">",
                },
            )
            chai.expect(queryCreateIndex2).to.be.a("string")
            chai.expect(queryCreateIndex2.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryCreateIndex2).to.deep.equal(
                "CREATE INDEX IF NOT EXISTS test ON test_table (count) WHERE count>?;",
            )
        })
        it("dropIndex", () => {
            const queryDropIndex1 = db.queries.dropIndex("test")
            chai.expect(queryDropIndex1).to.be.a("string")
            chai.expect(queryDropIndex1.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryDropIndex1).to.deep.equal("DROP INDEX test;")

            const queryDropIndex2 = db.queries.dropIndex("test", true)
            chai.expect(queryDropIndex2).to.be.a("string")
            chai.expect(queryDropIndex2.length).to.be.above(
                0,
                "Query not empty",
            )
            chai.expect(queryDropIndex2).to.deep.equal(
                "DROP INDEX IF EXISTS test;",
            )
        })
    })
}
