import {createSelector} from 'reselect';
import {initialState} from './reducer';

export const rootList = state => state.list || initialState;

export const loadingListSelector = () =>
  createSelector(rootList, globalState => globalState.checkList.loading);

export const checkListSelector = () =>
  createSelector(rootList, globalState => globalState.checkList);

export const weeklyCheckSelector = () =>
  createSelector(rootList, globalState => globalState.weeklyCheck);
