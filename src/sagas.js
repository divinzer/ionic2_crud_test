import {all} from 'redux-saga/effects';

import commonSaga from './modules/common/saga';

/**
 * Root saga
 * @returns {IterableIterator<AllEffect | GenericAllEffect<any> | *>}
 */
export default function* rootSagas() {
  yield all([commonSaga()]);
}
