import produce from 'immer';
import * as Actions from './constants';

export const initState = {
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
const listReducer = produce((draft, action) => {
  const {type, payload} = action;
  switch (type) {
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
  }
}, initState);

export default listReducer;
