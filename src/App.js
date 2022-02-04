/**
 *
 * Main app
 *
 * App Name:          위생점검
 * Author:            dev@plating.com
 *
 * @since             1.0.0
 *
 * @format
 * @flow
 */

import React from 'react';
// import OneSignal from 'react-native-onesignal';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppRouter from './AppRouter';
import NavigationService from 'src/utils/navigation';
import configureStore from './config-store';

const {store, persistor} = configureStore();
const App = () => {
  return (
    <NavigationContainer
      ref={navigationRef =>
        NavigationService.setTopLevelNavigator(navigationRef)
      }>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppRouter />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
};

export default App;
