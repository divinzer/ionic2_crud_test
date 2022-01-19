import React, {useState, useEffect, useCallback} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
// import isEqual from 'lodash/isEqual';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet, View, ActivityIndicator, RefreshControl} from 'react-native';
import {Header, ThemedView, Modal} from 'src/components';
import {SwipeListView} from 'react-native-swipe-list-view';
import ProductItem from 'src/containers/ProductItem';
import {TextHeader, CartIcon} from 'src/containers/HeaderComponent';
import Empty from 'src/containers/Empty';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import ButtonSwiper from 'src/containers/ButtonSwiper';

import {
  FETCH_WEEKLY_CHECK,
  FETCH_WEEKLY_CHECK_SUCCESS,
  FETCH_WEEKLY_CHECK_ERROR,
} from 'src/modules/firebase/constants';

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
  const dispatch = useDispatch();
  const {loading, weeklyCheck} = useSelector(stateSelector);
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [isModal, setModal] = useState(true);
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
    dispatch({type: FETCH_WEEKLY_CHECK});

    try {
      let arr = [];
      const ref = firestore()
        .collection('weeklyCheck')
        .where('isDeleted', '==', false)
        .orderBy('writtenAt', 'desc')
        .limit(8);
      await ref.onSnapshot(querySnapshot => {
        querySnapshot &&
          querySnapshot.forEach(doc => {
            // console.log('q', querySnapshot);
            const {weekName, ketchenMemo, writtenAt} = doc.data();
            arr.push({
              id: doc.id,
              weekName,
              ketchenMemo,
              writtenAt,
            });
          });
          // console.log('arr', arr);
        dispatch({type: FETCH_WEEKLY_CHECK_SUCCESS, payload: arr});
      });
    } catch (e) {
      dispatch({type: FETCH_WEEKLY_CHECK_ERROR, payload: e});
      // setLoading(false);
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
        renderData(weeklyCheck)
      )}
      <Container>
        <Button
          loading={false}
          title={'저장'}
          containerStyle={styles.marginBottom('big')}
          onPress={()=>{}}
        />
      </Container>
      <Modal
        visible={isModal}
        setModalVisible={value => setModal(value)}
        ratioHeight={0.1}>
        <Container />
      </Modal>
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
  marginBottom: type => ({
    marginBottom: margin[type],
  }),
});

export default WishListScreen;
