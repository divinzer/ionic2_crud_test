import React, {useState, useEffect, useCallback} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
// import isEqual from 'lodash/isEqual';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet, View, ActivityIndicator, RefreshControl} from 'react-native';
import {Header, ThemedView} from 'src/components';
import {SwipeListView} from 'react-native-swipe-list-view';
import ProductItem from 'src/containers/ProductItem';
import {TextHeader, CartIcon} from 'src/containers/HeaderComponent';
import Empty from 'src/containers/Empty';
import ButtonSwiper from 'src/containers/ButtonSwiper';

import {FETCH_WEEKLY_CHECK, FETCH_WEEKLY_CHECK_SUCCESS, FETCH_WEEKLY_CHECK_ERROR} from 'src/modules/firebase/constants';

import {
  loadingListSelector,
  weeklyCheckSelector,
} from 'src/modules/firebase/selectors';

import {margin} from 'src/components/config/spacing';
import {mainStack} from '../config/navigator';

const stateSelector = createStructuredSelector({
  loading: loadingListSelector(),
  weeklyCheck: weeklyCheckSelector(),
});

const WishListScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState();
  // const {loading, checkList, weeklyCheck, token} = useSelector(stateSelector);
  // componentDidMount() {
  //   this.fetchData();
  // }
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [refreshing, setRefreshing] = useState(false);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  // refreshing
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  }, [refreshing]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let arr = [];
      const ref = firestore()
        .collection('weeklyCheck')
        .orderBy('writtenAt', 'desc');
        // .where('isDeleted', '==', false);
      await ref.onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          const {weekName, ketchenMemo, writtenAt} = doc.data();
          arr.push({
            id: doc.id,
            weekName,
            ketchenMemo,
            writtenAt,
          });
        });
        setList(arr);
        console.log('arr', arr);
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
    }
  };

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
    if (!data) {
      return (
        <Empty
          icon="heart"
          title={'데이터가 없습니다.'}
          titleButton={'로그인 페이지로 가기'}
          clickButton={() => navigation.navigate(mainStack.check_list)}
        />
      );
    }
    return (
      <SwipeListView
        useFlatList
        keyExtractor={item => `${item.id}`}
        data={data}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
        disableLeftSwipe={false}
        disableRightSwipe={true}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        centerComponent={<TextHeader title={'위생점검 리스트'} />}
        rightComponent={<CartIcon />}
      />
      {loading ? (
        <View style={styles.viewLoading}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        renderData(list)
      )}
    </ThemedView>
  );
};

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

export default WishListScreen;
