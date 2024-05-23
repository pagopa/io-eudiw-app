import { CreditCardExpirationMonth, CreditCardExpirationYear } from "../input";

describe("CreditCardExpirationMonth", () => {
  it("should accept valid months", () => {
    const data: ReadonlyArray<any> = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ];
    data.forEach(d => expect(CreditCardExpirationMonth.is(d)).toBeTruthy());
  });

  it("should reject invalid months", () => {
    const data: ReadonlyArray<any> = [
      "0",
      "00",
      "13",
      "1",
      "123",
      "!1",
      "1!",
      "001",
      "010"
    ];
    data.forEach(d => expect(CreditCardExpirationMonth.is(d)).toBeFalsy());
  });
});

describe("CreditCardExpirationYear", () => {
  it("should accept valid years", () => {
    const data: ReadonlyArray<any> = ["17", "18", "29", "52", "99"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeTruthy());
  });

  it("should reject invalid years", () => {
    const data: ReadonlyArray<any> = ["170", "1", "*9", "5*"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeFalsy());
  });
});
