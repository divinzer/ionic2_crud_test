// @flow
import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from 'src/components';

import {white, black, orange, grey4} from 'src/components/config/colors';

const ShareIcon = ({onShare}) => {
  return (
    <TouchableOpacity onPress={onShare} style={styles.container}>
      <Icon
        color={black}
        type="font-awesome"
        name={'share'}
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

export default ShareIcon;
