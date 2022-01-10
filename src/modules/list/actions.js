// flow
import * as Actions from './constants';

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
