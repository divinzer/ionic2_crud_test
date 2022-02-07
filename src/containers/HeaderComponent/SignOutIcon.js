// @flow
import React from 'react';
import auth from '@react-native-firebase/auth';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Icon} from 'src/components';
import {rootSwitch} from 'src/config/navigator';

import {white, black, orange, grey4} from 'src/components/config/colors';

import {SIGN_OUT_SUCCESS} from 'src/modules/firebase/constants';

const SignOutIcon = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const signOut = async () => {
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

export default SignOutIcon;
