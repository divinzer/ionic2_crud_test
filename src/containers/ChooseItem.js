import React from 'react';

import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {withTheme, Avatar} from 'src/components';

import {white} from 'src/components/config/colors';
import {padding, margin, borderRadius} from 'src/components/config/spacing';

const ChooseItem = function (props) {
  const {
    active,
    topElement,
    // bottomElement,
    colorSelect,
    containerStyle,
    style,
    theme,
    onPress,
    onDelete,
    item,
  } = props;
  const {ChooseItem: colors} = theme;
  const borderContent = active
    ? colorSelect
      ? colorSelect
      : colors.borderColorSelect
    : colors.borderColor;
  const borderContentSub = active
    ? colorSelect
      ? colorSelect
      : colors.borderColorSelectSub
    : colors.borderColorSub;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.viewContent,
          {
            borderColor: borderContent,
          },
          containerStyle && containerStyle,
        ]}>
        <TouchableOpacity
          style={[
            styles.touchView,
            {
              // backgroundColor: active ? colors.bgColorSelect : colors.bgColor,
              borderColor: borderContentSub,
            },
            style && style,
          ]}
          onPress={() => onPress(item)}>
          {/* <View style={styles.top}>
            <Image
              source={require('src/assets/images/pDefault.png')}
              resizeMode="stretch"
              // style={[styles.image, styles.marginBottom('small')]}
            />
          </View> */}
          <View style={styles.top}>{topElement}</View>
          {/* <View style={styles.bottom}>{bottomElement}</View> */}
          {active ? (
            <TouchableOpacity onPress={() => onDelete(item)}>
              <Avatar
                rounded
                icon={{
                  name: 'x',
                  size: 12,
                  color: white,
                }}
                size={20}
                containerStyle={styles.icon}
                overlayContainerStyle={{
                  backgroundColor: colorSelect ?? colors.iconSelect,
                }}
              />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  viewContent: {
    borderRadius: borderRadius.base,
    borderWidth: 1,
    zIndex: 2,
    marginVertical: margin.base,
  },
  touchView: {
    // paddingHorizontal: padding.large,
    // paddingVertical: padding.small,
    borderWidth: 1,
    borderRadius: borderRadius.base - 1,
    maxWidth: 126,
    maxHeight: 126,
    zIndex: 2,
  },
  icon: {
    position: 'absolute',
    right: -10,
    top: -136,
  },
});

export default withTheme(ChooseItem);
