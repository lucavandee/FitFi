import { describe, expect, it } from "vitest";
import {
  isStatementTimeout,
  isTijdelijkeFout,
  SCHEMA_CACHE_LAADT_CODE,
  STATEMENT_TIMEOUT_SQLSTATE,
} from "../statementTimeout";

describe("isStatementTimeout", () => {
  it("herkent errcode 57014, wat de database zelf meegeeft", () => {
    expect(STATEMENT_TIMEOUT_SQLSTATE).toBe("57014");
    expect(
      isStatementTimeout({ code: "57014", message: "canceling statement due to statement timeout" })
    ).toBe(true);
    // Ook als het bericht onbekend of leeg is: de code beslist.
    expect(isStatementTimeout({ code: "57014", message: "" })).toBe(true);
  });

  it("herkent het bericht zonder errcode, zoals een proxy of een oudere client het doorgeeft", () => {
    expect(isStatementTimeout({ code: "", message: "canceling statement due to statement timeout" })).toBe(true);
    expect(isStatementTimeout({ message: "Statement Timeout" })).toBe(true);
  });

  it("herkent geen client-timeout: een verbinding die niet antwoordt is iets anders dan een database die afbreekt", () => {
    expect(isStatementTimeout({ code: "TimeoutError", message: "The operation was aborted due to timeout" })).toBe(false);
    expect(isStatementTimeout({ code: "AbortError", message: "This operation was aborted" })).toBe(false);
  });

  it("herkent geen andere fouten", () => {
    expect(isStatementTimeout({ code: "42P01", message: 'relation "x" does not exist' })).toBe(false);
    expect(isStatementTimeout({ code: "PGRST301", message: "JWT expired" })).toBe(false);
    expect(isStatementTimeout({ message: "boem" })).toBe(false);
    expect(isStatementTimeout({})).toBe(false);
  });
});

describe("isTijdelijkeFout", () => {
  it("herkent een statement-timeout, net als isStatementTimeout", () => {
    expect(isTijdelijkeFout({ code: "57014", message: "canceling statement due to statement timeout" })).toBe(true);
    expect(isTijdelijkeFout({ message: "canceling statement due to statement timeout" })).toBe(true);
  });

  it("herkent PostgREST dat zijn schema herlaadt, zoals na een DDL", () => {
    expect(SCHEMA_CACHE_LAADT_CODE).toBe("PGRST002");
    expect(
      isTijdelijkeFout({
        code: "PGRST002",
        message: "Could not query the database for the schema cache. Retrying.",
      })
    ).toBe(true);
    // Maar niet als statement-timeout: composeClient herkanst daar niet op.
    expect(isStatementTimeout({ code: "PGRST002", message: "Could not query the database for the schema cache." })).toBe(false);
  });

  it("herkent geen blijvende fouten en geen client-timeout", () => {
    expect(isTijdelijkeFout({ code: "42501", message: "permission denied for function get_kandidaten" })).toBe(false);
    expect(isTijdelijkeFout({ code: "PGRST301", message: "JWT expired" })).toBe(false);
    expect(isTijdelijkeFout({ code: "TimeoutError", message: "The operation was aborted due to timeout" })).toBe(false);
    expect(isTijdelijkeFout({})).toBe(false);
  });
});
