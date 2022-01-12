import produce from 'immer';
import {REHYDRATE} from 'redux-persist/lib/constants';
import * as Actions from './constants';
import {notificationMessage} from 'src/utils/error';

const initError = {
  type: 'error',
  message: '',
  errors: {},
};

export const initState = {
  isLogin: false,
  pending: false,
  user: {},
  token: '',
  loginError: initError,
  checkList: {
    data: [],
    loading: false,
    expire: '',
  },
  weeklyCheck: {
    data: [],
    loading: false,
  },
};

/**
 * Common reducer
 * @param draft
 * @param action
 * @returns {*}
 */
const firebaseReducer = produce((draft, action) => {
  const {type, payload} = action;
  switch (type) {
    // auth
    case Actions.SIGN_IN_WITH_FIREBASE:
      draft.pending = true;
      draft.loginError = initError;
      break;
    case Actions.SIGN_IN_WITH_FIREBASE_SUCCESS:
      draft.pending = false;
      draft.user = payload.user;
      draft.isLogin = true;
      draft.token = payload.token;
      break;
    case Actions.SIGN_IN_WITH_FIREBASE_ERROR:
      const errorSignIn = notificationMessage(payload);
      draft.pending = false;
      draft.loginError = errorSignIn;
      break;
    // sign out
    case Actions.SIGN_OUT_SUCCESS:
      draft = initState;
      break;
    // Check List
    case Actions.FETCH_CHECK_LIST:
      draft.checkList.loading = true;
      break;
    case Actions.FETCH_CHECK_LIST_SUCCESS:
      draft.checkList.data = payload;
      draft.checkList.loading = false;
      break;
    case Actions.FETCH_CHECK_LIST_ERROR:
      draft.checkList.loading = false;
      break;

    // Weekly Check
    case Actions.FETCH_WEEKLY_CHECK:
      draft.weeklyCheck.loading = true;
      break;
    case Actions.FETCH_WEEKLY_CHECK_SUCCESS:
      draft.weeklyCheck.data = payload;
      draft.weeklyCheck.loading = false;
      break;
    case Actions.FETCH_WEEKLY_CHECK_ERROR:
      draft.weeklyCheck.loading = false;
      break;
    case REHYDRATE:
      if (payload && payload.auth) {
        // Restore only user and isLogin draft
        const {auth} = payload;
        return {
          ...draft,
          user: auth.user,
          token: auth.token,
          isLogin: auth.isLogin,
        };
      } else {
        return initState;
      }
  }
}, initState);

export default firebaseReducer;
