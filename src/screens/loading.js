// @flow

import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import {START} from 'src/modules/firebase/constants';
const LoadingScreen = () => {
  const dispatch = useDispatch();
  const getStart = async () => {
    dispatch({type: START});
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  };

  useEffect(() => {
    getStart();
  }, []);

  return null;
};

export default LoadingScreen;
