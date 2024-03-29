// import {includes} from 'lodash';
import produce from 'immer';
import {REHYDRATE} from 'redux-persist/lib/constants';
import * as Actions from './constants';
import {notificationMessage} from 'src/utils/error';

const initError = '';

export const initState = {
  start: true,
  isLogin: false,
  loading: false,
  user: {
    uid: '',
  },
  role: '',
  token: '',
  error: initError,
  checkList: [],
  check: {},
  weeklyCheck: [],
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
    case Actions.START:
      draft.start = false;
      break;
    // auth
    case Actions.SIGN_IN_WITH_FIREBASE:
      draft.loading = true;
      draft.error = initError;
      break;
    case Actions.SIGN_IN_WITH_FIREBASE:
      draft.loading = true;
      draft.error = initError;
      break;
    case Actions.SIGN_IN_WITH_FIREBASE_SUCCESS:
      draft.loading = false;
      draft.isLogin = true;
      draft.user = payload._user;
      draft.token = payload.token;
      break;
    case Actions.SIGN_IN_WITH_FIREBASE_ERROR:
      const errorSignIn = notificationMessage(payload);
      draft.loading = false;
      draft.isLogin = false;
      draft.error = errorSignIn;
      break;
    // sign out
    case Actions.SIGN_OUT_SUCCESS:
      // draft = initState;
      draft.loading = false;
      draft.user = {};
      draft.token = '';
      draft.isLogin = false;
      draft.auth = '';
      draft.error = initError;
      draft.checkList = [];
      draft.check = {};
      draft.weeklyCheck = [];
      break;
    // Auth
    case Actions.FETCH_AUTH:
      draft.loading = true;
      draft.error = initError;
      break;
    case Actions.FETCH_AUTH_SUCCESS:
      draft.role = payload.role;
      draft.loading = false;
      break;
    case Actions.FETCH_AUTH_ERROR:
      draft.loading = false;
      draft.error = notificationMessage(payload);
      break;
    // Check List
    case Actions.FETCH_CHECK_LIST:
      draft.loading = true;
      draft.error = initError;
      break;
    case Actions.FETCH_CHECK_LIST_SUCCESS:
      draft.checkList = payload;
      draft.loading = false;
      break;
    case Actions.FETCH_CHECK_LIST_ERROR:
      draft.loading = false;
      draft.error = notificationMessage(payload);
      break;
    // Check
    case Actions.FETCH_CHECK:
      draft.loading = true;
      break;
    case Actions.FETCH_CHECK_SUCCESS:
      draft.loading = false;
      draft.check = payload;
      break;
    case Actions.FETCH_CHECK_ERROR:
      draft.loading = false;
      draft.error = notificationMessage(payload);
      break;
    case Actions.CHANGE_CHECK_FEEDBACK:
      if (draft.checkList.length > 0) {
        const item = draft.checkList.find(
          list => list.checkName === payload.name,
        );
        if (item) {
          // console.log('feedback', JSON.stringify(item));
          item.feedback = payload.value;
        }
      }
      break;
    case Actions.CHANGE_CHECK_LIST:
      draft.loading = false;
      break;
    case Actions.CHANGE_CHECK_LIST_SUCCESS:
      draft.loading = false;
      // console.log('aa', payload.name);
      if (draft.checkList.length > 0) {
        const item = draft.checkList.find(
          list => list.checkName === payload.name,
        );

        if (item) {
          // console.log('item', JSON.stringify(item));
          item.checked = payload.value;
        }
      }
      break;
    case Actions.CHANGE_CHECK_LIST_ERROR:
      draft.loading = false;
      draft.error = notificationMessage(payload);
      break;
    // Weekly Check
    case Actions.FETCH_WEEKLY_CHECK:
      draft.loading = true;
      draft.error = initError;
      break;
    case Actions.FETCH_WEEKLY_CHECK_SUCCESS:
      draft.weeklyCheck = payload;
      draft.loading = false;
      break;
    case Actions.FETCH_WEEKLY_CHECK_ERROR:
      draft.loading = false;
      draft.error = notificationMessage(payload);
      break;
    // case REHYDRATE:
    //   if (payload) {
    //     // Restore only user and isLogin draft
    //     // const {auth} = payload;
    //     return {
    //       ...draft,
    //       // user: auth.user,
    //       // token: auth.token,
    //       // isLogin: auth.isLogin,
    //     };
    //   } else {
    //     return initState;
    //   }
  }
}, initState);

export default firebaseReducer;
