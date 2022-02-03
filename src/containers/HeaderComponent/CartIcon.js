// @flow
import React from 'react';
import auth from '@react-native-firebase/auth';
import {StyleSheet, TouchableOpacity, Animated} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {ScreenProps} from 'react-native-screens';
import {Badge, Icon} from 'src/components';
import NavigationServices from 'src/utils/navigation';
import {rootSwitch} from 'src/config/navigator';

import {white, black, orange, grey4} from 'src/components/config/colors';

import {SIGN_OUT_SUCCESS} from 'src/modules/firebase/constants';

const CartIcon = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const signOut = async () => {
    // console.log('sign out');
    dispatch({type: SIGN_OUT_SUCCESS});
    navigation.navigate(rootSwitch.login);
    try {
      await auth().signOut();
    } catch (e) {
      console.log('e', e);
    }
  };

  return (
    <TouchableOpacity onPress={signOut} style={styles.container}>
      <Animated.View
        style={[
          styles.view,
          // {
          //   transform: [{scale: state.scale}],
          // },
        ]}>
        {/* <Badge
          status="error"
          badgeStyle={badgeStyle}
          textStyle={textStyle}
          value={count}
        /> */}
      </Animated.View>
      <Icon
        color={black}
        type="font-awesome"
        name={'sign-out'}
        size={20}
        underlayColor={'transparent'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  view: {
    zIndex: 9999,
  },
});
CartIcon.defaultProps = {
  count: 0,
  isAnimated: false,
  iconProps: {},
};

// const mapStateToProps = state => ({
//   count: countItemSelector(state),
//   configs: configsSelector(state),
// });

export default CartIcon;
