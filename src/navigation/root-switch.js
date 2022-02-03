import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {rootSwitch} from 'src/config/navigator';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';

import Loading from 'src/screens/loading';
import GetStart from 'src/screens/get-start';
import Login from 'src/screens/auth/login';
import CheckListScreen from 'src/screens/check-list';
import FeedbackScreen from 'src/screens/feedback';
import WishListScreen from 'src/screens/wishlist';
import {
  isGettingStartSelector,
  loadingSelector,
  requiredLoginSelector,
} from 'src/modules/common/selectors';
import {isLoginSelector} from 'src/modules/firebase/selectors';
import {connect} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import {SUPPORT_DIGITS_PLUGIN} from 'src/config/auth';

const Stack = createStackNavigator();

const stateSelector = createStructuredSelector({
  isLogin: isLoginSelector(),
});

function RootStack({loading, isGettingStart, loginRequired}) {
  /**
   * Hide Splash after fetch data
   */
  const {isLogin} = useSelector(stateSelector);
  console.log('isLogin', isLogin);
  if (!loading) {
    SplashScreen.hide();
  }
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {loading ? (
        <Stack.Screen name={rootSwitch.loading} component={Loading} />
      ) : isLogin ? (
        <>
          <Stack.Screen
            options={{headerShown: false}}
            name={rootSwitch.wish_list}
            component={WishListScreen}
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
    isGettingStart: isGettingStartSelector(state),
    loading: loadingSelector(state),
    loginRequired: requiredLoginSelector(state),
  };
};

export default connect(mapStateToProps)(RootStack);
