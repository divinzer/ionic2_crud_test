import firestore from '@react-native-firebase/firestore';
import {put, call, select, takeEvery} from 'redux-saga/effects';
import {LoginManager} from 'react-native-fbsdk';
import AsyncStorage from '@react-native-community/async-storage';
import {showMessage} from 'react-native-flash-message';
import {handleError} from 'src/utils/error';

import * as Actions from './constants';
import {userIdSelector} from './selectors';

import {
  loginWithEmail,
  isLogin,
  logout,
  fetchChecklist,
  fetchWeeklyCheck,
} from './service';

import {requiredLoginSelector} from '../common/selectors';

import NavigationService from 'src/utils/navigation';
import {rootSwitch} from 'src/config/navigator';

async function signOut() {
  // Logout
  await logout();
}

/**
 * Do login success
 * @param token
 * @param user
 * @returns {IterableIterator<*>}
 */
function* doLoginSuccess(token, user = {}, method = 'email') {
  console.log('token', token);
  yield put({
    type: Actions.SIGN_IN_WITH_FIREBASE_SUCCESS,
    payload: {token, user},
  });
  yield call(NavigationService.navigate, rootSwitch.main);
  yield call(AsyncStorage.setItem, 'token', token);
  yield call(AsyncStorage.setItem, 'method', method);
}

/**
 * Sign In saga
 * @param username
 * @param password
 * @returns {IterableIterator<*>}
 */
function* signInWithEmailSaga({username, password}) {
  try {
    const {user} = yield call(loginWithEmail, {
      username,
      password,
    });
    console.log('user', user);
    const {uid} = user;
    console.log('token', uid);
    yield call(doLoginSuccess, uid, user, 'email');
  } catch (e) {
    // yield call(handleError, e)
    yield put({
      type: Actions.SIGN_IN_WITH_FIREBASE_ERROR,
      payload: {
        message: e.message,
      },
    });
  }
}

/**
 * Sign out saga
 * @returns {IterableIterator<*>}
 */
function* signOutSaga() {
  try {
    const requiredLogin = yield select(requiredLoginSelector);
    yield call(AsyncStorage.removeItem, 'token');
    if (requiredLogin) {
      yield call(NavigationService.navigate, rootSwitch.auth);
    }
    yield put({type: Actions.SIGN_OUT_SUCCESS});
    yield call(signOut);
  } catch (e) {
    console.log(e);
    // yield call(handleError, e);
  }
}

/**
 * Fetch fetchChecklist saga
 * @returns {IterableIterator<*>}
 */
// function* fetchCheckListSaga() {
//   try {
//     const data = yield call(fetchChecklist);
//     yield put({
//       type: Actions.FETCH_CHECK_LIST_SUCCESS,
//       payload: data,
//     });
//   } catch (error) {
//     yield put({
//       type: Actions.FETCH_CHECK_LIST_ERROR,
//     });
//   }
// }

/**
 * Fetch pfetchWeeklyCheck saga
 * @returns {IterableIterator<*>}
 */
// function* fetchweeklyListSaga() {
//   try {
//     let ref = firestore().collection('weeklyCheck');
//     const snapShot = yield call(ref.get);
//     let list = [];
//     snapShot.forEach(doc => {
//       list.push(doc.data());
//     });
//     yield put({
//       type: Actions.FETCH_WEEKLY_CHECK_SUCCESS,
//       payload: list,
//     });
//   } catch (error) {
//     yield put({
//       type: Actions.FETCH_WEEKLY_CHECK_ERROR,
//     });
//   }
// }

export default function* firebaseSaga() {
  yield takeEvery(Actions.SIGN_IN_WITH_FIREBASE, signInWithEmailSaga);
  yield takeEvery(Actions.SIGN_OUT, signOutSaga);
  // yield takeEvery(Actions.FETCH_CHECK_LIST, fetchCheckListSaga);
  // yield takeEvery(Actions.FETCH_WEEKLY_CHECK, fetchweeklyListSaga);
}
