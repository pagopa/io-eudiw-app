import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store/types';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
}>();
