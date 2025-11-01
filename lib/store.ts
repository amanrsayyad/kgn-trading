import { configureStore } from "@reduxjs/toolkit";
import tradingReducer from "./features/trading/tradingSlice";
import authReducer from "./features/auth/authSlice";
import customerReducer from "./features/customer/customerSlice";
import invoiceReducer from "./features/invoice/invoiceSlice";
import vehicleReducer from "./features/vehicle/vehicleSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      trading: tradingReducer,
      auth: authReducer,
      customer: customerReducer,
      invoice: invoiceReducer,
      vehicle: vehicleReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
