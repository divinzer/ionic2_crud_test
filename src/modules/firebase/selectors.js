import {createSelector} from 'reselect';
import {initialState} from './reducer';

export const firebase = state => state.firebase || initialState;
export const isGettingStartSelector = () => createSelector(firebase, data => data.start);
export const roleSelector = () => createSelector(firebase, data => data.role);

export const isLoginSelector = () =>
  createSelector(firebase, data => data.isLogin);

/**
 * Get user id
 */
export const userSelector = () => createSelector(firebase, data => data.user);

/**
 * Token selector
 * @type {OutputSelector<unknown, *, (res: *) => *>}
 */
export const tokenSelector = () => createSelector(firebase, data => data.token);

export const loadingListSelector = () =>
  createSelector(firebase, data => data.loading);

export const checkSelector = () =>
  createSelector(firebase, data => data.check);

export const loadingCheckListSelector = () =>
  createSelector(firebase, data => data.loading);

export const checkListSelector = () =>
  createSelector(firebase, data => data.checkList);

export const weeklyCheckSelector = () =>
  createSelector(firebase, data => data.weeklyCheck);
