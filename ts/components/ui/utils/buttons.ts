import {
  IOButtonBlockSpecificProps,
} from "@pagopa/io-app-design-system";

export type ButtonBlockProps = Omit<
  IOButtonBlockSpecificProps,
  "fullWidth" | "variant"
>;
