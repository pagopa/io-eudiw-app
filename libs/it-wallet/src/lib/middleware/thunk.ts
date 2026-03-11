import { createAsyncThunk } from '@reduxjs/toolkit';
import { WalletPartialRootState } from '../store';


export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: WalletPartialRootState;
}>();
