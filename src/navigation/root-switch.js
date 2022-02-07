import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {rootSwitch} from 'src/config/navigator';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';

import Loading from 'src/screens/loading';
import Login from 'src/screens/login';
import CheckListScreen from 'src/screens/checkList';
import FeedbackScreen from 'src/screens/feedback';
import HygieneListScreen from 'src/screens/hygieneList';
// import {
//   loadingSelector,
//   requiredLoginSelector,
// } from 'src/modules/common/selectors';
import {
  isGettingStartSelector,
  isLoginSelector,
} from 'src/modules/firebase/selectors';
import {connect} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';

const Stack = createStackNavigator();

const stateSelector = createStructuredSelector({
  start: isGettingStartSelector(),
  isLogin: isLoginSelector(),
});

function RootStack({loading}) {
  /**
   * Hide Splash after fetch data
   */
  const {start, isLogin} = useSelector(stateSelector);
  console.log('isLogin', isLogin);
  if (!loading) {
    SplashScreen.hide();
  }
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {start ? (
        <Stack.Screen name={rootSwitch.loading} component={Loading} />
      ) : isLogin ? (
        <>
          <Stack.Screen
            options={{headerShown: false}}
            name={rootSwitch.hygiene_list}
            component={HygieneListScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name={rootSwitch.login}
            component={Login}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name={rootSwitch.check_list}
            component={CheckListScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name={rootSwitch.feedback}
            component={FeedbackScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen name={rootSwitch.auth} component={Login} />
          {/* <Stack.Screen name={rootSwitch.wish_list} component={WishListScreen} /> */}
        </>
      )}
    </Stack.Navigator>
  );
}

const mapStateToProps = state => {
  return {
    // isGettingStart: isGettingStartSelector(state),
    // loading: loadingSelector(state),
    // loginRequired: requiredLoginSelector(state),
  };
};

export default connect(mapStateToProps)(RootStack);
