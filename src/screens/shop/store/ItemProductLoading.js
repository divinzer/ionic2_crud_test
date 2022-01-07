import * as React from 'react';
import {ThemedView, ThemeConsumer} from 'src/components';

function ItemProductLoading(props) {
  const {style} = props;
  const height = 130;
  const borderBottomWidth = 1;
  return (
    <ThemeConsumer>
      {({theme}) => (
        <ThemedView
          colorSecondary
          style={[
            {
              height: height,
              borderBottomWidth: borderBottomWidth,
              borderColor: theme.colors.border,
            },
            style && style,
          ]}
        />
      )}
    </ThemeConsumer>
  );
}

export default ItemProductLoading;
