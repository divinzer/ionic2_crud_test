import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const loginWithEmail = ({username, password}) =>
  auth().signInWithEmailAndPassword(username, password);
export const logout = () => auth().get(`/v1/logout`);

export const isLogin = () => auth().get(`/v1/current`);

export const fetchChecklist = async () => {
  const user = await auth().currentUser;
  console.log('user', user);
  // console.log('return', firestore().collection('checklist').doc('checkItems').get());
  firestore()
    .collection('checklist')
    .doc('checkItems')
    .get()
    .onSnapshot(documentSnapshot => {
      console.log('User data: ', documentSnapshot.data());
      return documentSnapshot.data();
    });
  // return firestore().collection('Users').doc(user.user.id).set();
};
export const fetchWeeklyCheck = async () => {
  const ref = await firestore().collection('weeklyCheck');
  ref.onSnapshot(querySnapshot => {
    const list = [];
    querySnapshot.forEach(doc => {
      const {weekName, ketchenMemo} = doc.data();
      list.push({
        id: doc.id,
        weekName,
        ketchenMemo,
      });
    });
    console.log('list', list);
    return list;
  });
};
