import {put, call, takeEvery} from 'redux-saga/effects';

import * as Actions from './constants';

import {fetchChecklist, fetchWeeklyCheck} from './service';

/**
 * Fetch fetchChecklist saga
 * @returns {IterableIterator<*>}
 */
function* fetchCheckListSaga() {
  try {
    const data = yield call(fetchChecklist);
    console.log('data', data);

    yield put({
      type: Actions.FETCH_CHECK_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    yield put({
      type: Actions.FETCH_CHECK_LIST_ERROR,
    });
  }
}

/**
 * Fetch pfetchWeeklyCheck saga
 * @returns {IterableIterator<*>}
 */
function* fetchPaymentGatewaySaga() {
  try {
    const data = yield call(fetchWeeklyCheck);
    yield put({
      type: Actions.FETCH_WEEKLY_CHECK_SUCCESS,
      payload: data,
    });
  } catch (error) {
    yield put({
      type: Actions.FETCH_WEEKLY_CHECK_ERROR,
    });
  }
}

export default function* listSaga() {
  yield takeEvery(Actions.FETCH_CHECK_LIST, fetchCheckListSaga);
  yield takeEvery(Actions.FETCH_WEEKLY_CHECK, fetchPaymentGatewaySaga);
}
