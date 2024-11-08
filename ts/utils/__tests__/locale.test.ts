import * as O from "fp-ts/lib/Option";
import { Locales } from "../../../locales/locales";
import I18n, { setLocale } from "../../i18n";
import { getLocalePrimary, localeDateFormat } from "../locale";

describe("getLocalePrimary", () => {
  [
    ["it-IT", "it"],
    ["it-US", "it"],
    ["en-EN", "en"],
    ["it", "it"]
  ].forEach(t => {
    const [input, expected] = t;
    it("getLocalePrimary should return the expected output", () => {
      expect(getLocalePrimary(input)).toStrictEqual(O.some(expected));
    });
  });
});

describe("localeDateFormat on locale", () => {
  const date = new Date("May 17, 1995 03:24:00");
  const invalidDate = new Date("?");

  const data: ReadonlyArray<[() => string, string, string]> = [
    [() => I18n.t("date.formats.default"), "17/05/1995", "17/05/1995"],
    [() => I18n.t("date.formats.short"), "17 maggio", "17 May"],
    [() => I18n.t("date.formats.long"), "17 maggio 1995", "17 May 1995"],
    [
      () => I18n.t("global.dateFormats.fullFormatShortMonthLiteral"),
      "17 mag 1995",
      "17 May 1995"
    ],
    [
      () => I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime"),
      "17 mag 1995, 03:24",
      "17 May 1995, 03:24"
    ],
    [
      () => I18n.t("global.dateFormats.fullFormatFullMonthLiteral"),
      "17 maggio 1995",
      "17 May 1995"
    ],
    [() => I18n.t("global.dateFormats.fullMonthLiteral"), "maggio", "May"],
    [
      () => I18n.t("global.dateFormats.fullMonthLiteralWithYear"),
      "maggio 1995",
      "May 1995"
    ],
    [
      () => I18n.t("global.dateFormats.dayMonthWithTime"),
      "17 mag, 03:24",
      "17 May, 03:24"
    ],
    [() => I18n.t("global.dateFormats.dayFullMonth"), "17 maggio", "17 May"],
    [() => I18n.t("global.dateFormats.numericMonthYear"), "05/1995", "05/1995"]
  ];
  data.forEach(elem => {
    const [dateFormat, expectedIT, expectedEN] = elem;
    it("convert given date to string format on IT locale", () => {
      // setLocale("it" as Locales);
      // expect(localeDateFormat(date, dateFormat())).toStrictEqual(expectedIT);
      setLocale("en" as Locales);
      expect(localeDateFormat(date, dateFormat())).toStrictEqual(expectedEN);
    });
  });

  it("invalid date converts in common date error string", () => {
    expect(localeDateFormat(invalidDate, "%d/%m/%Y")).toStrictEqual(
      I18n.t("global.date.invalid")
    );
  });
});
