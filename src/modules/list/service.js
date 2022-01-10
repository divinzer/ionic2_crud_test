import firestore from '@react-native-firebase/firestore';
export const fetchChecklist = () => firestore().collection('checkList');
export const fetchWeeklyCheck = () => firestore().collection('weeklyCheck');
