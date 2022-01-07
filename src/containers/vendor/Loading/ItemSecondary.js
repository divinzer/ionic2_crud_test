// @flow
import * as React from 'react';
import {ViewPropTypes} from 'react-native';
import {ThemedView} from 'src/components';
import {borderRadius} from 'src/components/config/spacing';

type Props = {
  style?: ViewPropTypes,
};

function ItemSecondary(props: Props) {
  const {style} = props;
  const width = 135;
  const height = 150;
  return (
    <ThemedView
      colorSecondary
      style={[
        {
          width: width,
          height: height,
          borderRadius: borderRadius.large,
        },
        style && style,
      ]}
    />
  );
}

export default ItemSecondary;
