import { createAsyncThunk } from '@reduxjs/toolkit';
import { WalletCombinedRootState } from '../store';


export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: WalletCombinedRootState;
}>();
