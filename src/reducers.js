import {combineReducers} from 'redux';

// import authReducer from './modules/auth/reducer';
// import commonReducer from './modules/common/reducer';
import firebaseReducer from './modules/firebase/reducer';

/**
 * Root reducer
 * @type {Reducer<any> | Reducer<any, AnyAction>}
 */
const rootReducers = combineReducers({
  // common: commonReducer,
  // auth: authReducer,
  firebase: firebaseReducer,
});

export default rootReducers;
