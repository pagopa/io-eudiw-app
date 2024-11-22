type AsyncStatusValues = {
  success: boolean;
  loading: boolean;
  error: {status: false; error: undefined} | {status: true; error: unknown};
};

const asyncStatusInitial: AsyncStatusValues = {
  success: false,
  loading: false,
  error: {status: false, error: undefined}
};

const asyncStateSuccess: AsyncStatusValues = {
  success: true,
  loading: false,
  error: {status: false, error: undefined}
};

const asyncStateLoading: AsyncStatusValues = {
  success: false,
  loading: true,
  error: {status: false, error: undefined}
};

const asyncStateError = (errorValue: unknown): AsyncStatusValues => ({
  success: false,
  loading: false,
  error: {status: true, error: errorValue}
});

export {
  asyncStateSuccess,
  asyncStateLoading,
  asyncStatusInitial,
  asyncStateError,
  type AsyncStatusValues
};
