/**
 *
 * App router
 *
 *
 * App Name:          hygiene check
 * Description:       This is a short description of what the plugin does. It's displayed in the WordPress admin area.
 * Version:           1.1.0
 * Author:            plating.com
 *
 * @since             1.0.0
 *
 * @format
 * @flow
 */

import React, {useState, useEffect} from 'react';
// import './config-i18n';
import {StatusBar} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import FlashMessage from 'react-native-flash-message';
import {getThemeLight} from './components/config/colors';
import {ThemeProvider} from 'src/components';
import Router from './navigation/root-switch';
import Unconnected from './containers/Unconnected';

export default function AppRouter() {
  const colors = {
    primary: '#121212',
    secondary: '#777777',
    bgColor: '#ffffff',
    bgColorSecondary: '#f4f4f4',
  };

  const themeColor = getThemeLight(colors);
  const barStyle = 'dark-content';
  const [isCheck, setCheck] = useState(false);
  const [isConnected, setConnected] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      if (!isConnected) {
        setConnected(false);
      }
      if (isCheck && isConnected) {
        setConnected(true);
        setCheck(false);
      }
    });
  }, [isCheck, isConnected]);

  const checkInternet = () => {
    setCheck(true);
  };

  return (
    <ThemeProvider theme={themeColor}>
      <StatusBar
        translucent
        barStyle={barStyle}
        backgroundColor="transparent"
      />
      {!isConnected ? <Unconnected clickTry={checkInternet} /> : <Router />}
      <FlashMessage position="top" />
    </ThemeProvider>
  );
}

// export default compose(withTranslation(), connect(mapStateToProps))(AppRouter);
