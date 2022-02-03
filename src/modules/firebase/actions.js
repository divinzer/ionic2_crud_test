// flow
import * as Actions from './constants';

/**
 * Action login
 * @param username
 * @param password
 * @returns {{type: string, username: *, password: *}}
 */
export function signInWithEmail({username, password}) {
  return {
    type: Actions.SIGN_IN_WITH_FIREBASE,
    username,
    password,
  };
}

/**
 * validate login
 * @returns {{type: string}}
 */
export function isLogin() {
  return {
    type: Actions.IS_LOGIN,
  };
}

export function checkAuth() {
  return {
    type: Actions.FETCH_AUTH,
  };
}

/**
 * Action sign out
 * @returns {{type: string}}
 */
export function signOut() {
  return {
    type: Actions.SIGN_OUT_SUCCESS,
  };
}

/**
 * Fetch countries
 * @returns {{type: string}}
 */
export function fetchChecklist() {
  return {
    type: Actions.FETCH_CHECK_LIST,
  };
}

/**
 * Fetch payment gateways
 * @returns {{type: string}}
 */
export function fetchWeeklyCheck() {
  return {
    type: Actions.FETCH_WEEKLY_CHECK,
  };
}
