import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {tokenSelector} from './selectors';

export const loginWithEmail = ({username, password}) =>
  auth().signInWithEmailAndPassword(username, password);
export const logout = () => auth().get(`/v1/logout`);

export const isLogin = () => auth().get(`/v1/current`);

export const fetchChecklist = async () => {
  // const idTokenResult = await auth().currentUser.getIdTokenResult();
  console.log('id', auth().currentUser);
  const userId = tokenSelector();
  // return firestore().collection('checkList').doc(idTokenResult.token).get();
  return firestore().collection('checkList').doc(userId).get();
};
export const fetchWeeklyCheck = () => firestore().collection('weeklyCheck');
