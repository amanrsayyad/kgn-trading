import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TradingState {
  portfolio: number;
  activeTrades: number;
}

const initialState: TradingState = {
  portfolio: 0,
  activeTrades: 0,
};

export const tradingSlice = createSlice({
  name: "trading",
  initialState,
  reducers: {
    setPortfolio: (state, action: PayloadAction<number>) => {
      state.portfolio = action.payload;
    },
    incrementActiveTrades: (state) => {
      state.activeTrades += 1;
    },
    decrementActiveTrades: (state) => {
      state.activeTrades -= 1;
    },
  },
});

export const { setPortfolio, incrementActiveTrades, decrementActiveTrades } =
  tradingSlice.actions;

export default tradingSlice.reducer;
