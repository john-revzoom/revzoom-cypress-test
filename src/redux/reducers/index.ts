import { combineReducers } from "redux";
import selectmediaReducer from "./selectmediaReducer";
import smartcropReducer from "./smartcropReducer";

const rootReducer = combineReducers({
  smartcrop: smartcropReducer,
  selectmedia: selectmediaReducer
});

export default rootReducer;
