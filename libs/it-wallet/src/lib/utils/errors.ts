import { serializeError } from "serialize-error"

export const serializeErrorOrUnknown = (error: unknown) => {
  const serialized = serializeError(error)
  if(Object.keys(serialized).length === 0) {
    return error;
  }else {
    return serialized
  }
}
