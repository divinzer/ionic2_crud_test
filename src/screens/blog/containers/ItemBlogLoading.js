import * as React from 'react';
import {ThemedView, ThemeConsumer} from 'src/components';
import {padding} from 'src/components/config/spacing';

function ItemBlogLoading(props) {
  const {height, style} = props;
  const borderBottomWidth = 1;
  return (
    <ThemeConsumer>
      {({theme}) => (
        <ThemedView
          colorSecondary
          style={[
            {
              height: height + 2 * padding.big,
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

export default ItemBlogLoading;
