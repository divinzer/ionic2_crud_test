import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
// import isEqual from 'lodash/isEqual';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet, View, ActivityIndicator, I18nManager} from 'react-native';
import {Header, ThemedView} from 'src/components';
import {SwipeListView} from 'react-native-swipe-list-view';
import ProductItem from 'src/containers/ProductItem';
import {TextHeader, CartIcon} from 'src/containers/HeaderComponent';
import Empty from 'src/containers/Empty';
import ButtonSwiper from 'src/containers/ButtonSwiper';

import {fetchChecklist, fetchWeeklyCheck} from 'src/modules/firebase/actions';

import {
  loadingListSelector,
  checkListSelector,
  weeklyCheckSelector,
  tokenSelector,
} from 'src/modules/firebase/selectors';

import {margin} from 'src/components/config/spacing';
import {homeTabs} from 'src/config/navigator';

const stateSelector = createStructuredSelector({
  loading: loadingListSelector(),
  checkList: checkListSelector(),
  weeklyCheck: weeklyCheckSelector(),
  token: tokenSelector(),
});

export default function WishListScreen() {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {loading, checkList, weeklyCheck, token} = useSelector(stateSelector);
  // componentDidMount() {
  //   this.fetchData();
  // }
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);
  const subtitle = '위생점검 리스트';

  const fetchData = () => dispatch(fetchWeeklyCheck());

  useEffect(() => {
    fetchData();
  }, []);

  // useEffect(() => {
  //   fetchData();
  // }, [checkList, weeklyCheck]);

  const removeItem = product_id => {
    dispatch(removeWishList(product_id));
  };

  const renderData = data => {
    if (!user) {
      return (
        <Empty
          icon="heart"
          title={t('empty:text_title_wishlist')}
          subTitle={t('empty:text_subtitle_wishlist')}
          titleButton={t('common:text_go_shopping')}
          clickButton={() => navigation.navigate(homeTabs.shop)}
        />
      );
    }
    return (
      <SwipeListView
        useFlatList
        keyExtractor={item => `${item.id}`}
        data={weeklyCheck}
        renderItem={({item, index}) => (
          <ProductItem
            item={item}
            style={index === 0 ? styles.firstItem : undefined}
            type="wishlist"
          />
        )}
        renderHiddenItem={({item}) => (
          <View style={styles.viewSwiper}>
            <ButtonSwiper onPress={() => removeItem(item.id)} />
          </View>
        )}
        leftOpenValue={70}
        rightOpenValue={-70}
        disableLeftSwipe={true}
        disableRightSwipe={false}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        centerComponent={
          <TextHeader title={t('common:text_wishList')} subtitle={subtitle} />
        }
        rightComponent={<CartIcon />}
      />
      {loading ? (
        <View style={styles.viewLoading}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        renderData(weeklyCheck.data)
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewLoading: {
    marginVertical: margin.large,
  },
  viewSwiper: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  firstItem: {
    borderTopWidth: 1,
  },
});

// const mapStateToProps = state => ({
//   data: dataWishListSelector(state).toJS(),
//   loading: loadingWishListSelector(state),
//   wishList: wishListSelector(state).toJS(),
//   countWishlist: countWishListSelector(state),
// });

// export default connect(mapStateToProps)(withTranslation()(WishListScreen));
