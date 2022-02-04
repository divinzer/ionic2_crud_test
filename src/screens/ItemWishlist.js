import React from 'react';
import {useNavigation} from '@react-navigation/native';
import unescape from 'lodash/unescape';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {Icon, Text, Button, ThemeConsumer} from 'src/components';
import {rootSwitch} from 'src/config/navigator';
import {padding, margin} from 'src/components/config/spacing';
import {sizes} from 'src/components/config/fonts';
import {white, black, orange, grey4} from 'src/components/config/colors';

const ItemWishlist = React.memo(props => {
  const navigation = useNavigation();
  const {item, style, onModal} = props;
  const {weekName, type, isDeleted, hasFeedback, id, kitchenMemo, writeenAt} = item;
  const goCheckList = () =>
    navigation.navigate(rootSwitch.check_list, {
      item,
    });

  // const titleButton =
  //   type === SIMPLE ? t('common:text_add_cart') : t('common:text_choose_item');
  return (
    <ThemeConsumer>
      {({theme}) => (
        <View style={{backgroundColor: theme.ProductItem2.backgroundColor}}>
          <TouchableOpacity
            style={[
              styles.container,
              styles.row,
              {borderColor: theme.colors.border},
              style && style,
            ]}
            onPress={goCheckList}>
            {/* <Image
              source={
                images && images[0]
                  ? {uri: images[0].src, cache: 'reload'}
                  : require('src/assets/images/pDefault.png')
              }
              resizeMode="stretch"
              style={styles.image}
            /> */}
            <View style={[styles.right, styles.col]}>
              <View style={[styles.info, styles.row]}>
                <Text colorSecondary style={[styles.textName, styles.col]}>
                  {unescape(weekName)}
                </Text>
                {/* <Price price_format={price_format} type={type} /> */}
                {hasFeedback && (
                  <Icon
                    size={19}
                    type="font-awesome"
                    name={'exclamation-circle'}
                    color={'orange'}
                    // onPress={wishListAction}
                    underlayColor={'transparent'}
                    // style={{marginRight: 100}}
                  />
                )}
                <Text style={{marginRight: 20}} />
                <Icon
                  size={19}
                  type="font-awesome"
                  name={'pencil'}
                  color={grey4}
                  onPress={() => {
                    onModal('주차이름 변경', weekName, item);
                  }}
                  underlayColor={'transparent'}
                  // style={{marginRight: 10}}
                />
              </View>
              {/* {type !== SIMPLE ||
              (type === SIMPLE &&
                stockStatusList.includes(stock_status) &&
                purchasable &&
                configs.toggleCheckout) ? (
                <Button
                  title={titleButton}
                  buttonStyle={styles.button}
                  titleStyle={styles.titleButton}
                  size={'small'}
                  loading={loading}
                  onPress={type === SIMPLE ? getAddToCart : goCheckList}
                />
              ) : null} */}
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ThemeConsumer>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  container: {
    padding: padding.large,
    borderBottomWidth: 1,
  },
  image: {
    width: 79,
    height: 94,
  },
  right: {
    paddingLeft: padding.large,
    alignItems: 'flex-start',
  },
  info: {
    marginBottom: margin.small,
  },
  textName: {
    marginRight: margin.large,
  },
  button: {
    paddingHorizontal: padding.big,
    backgroundColor: black,
    borderColor: black,
  },
  titleButton: {
    color: white,
    fontSize: sizes.h6,
  },
});

export default ItemWishlist;
