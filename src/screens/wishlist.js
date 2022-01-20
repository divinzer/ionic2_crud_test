import React, {useState, useEffect, useCallback} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
// import isEqual from 'lodash/isEqual';
import NavigationServices from 'src/utils/navigation';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet, View, ActivityIndicator, RefreshControl} from 'react-native';
import {Header, ThemedView, Modal} from 'src/components';
import {SwipeListView} from 'react-native-swipe-list-view';
import ProductItem from 'src/containers/ProductItem';
import {TextHeader, CartIcon, IconHeader} from 'src/containers/HeaderComponent';
import Empty from 'src/containers/Empty';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import ButtonSwiper from 'src/containers/ButtonSwiper';
import Input from 'src/containers/input/Input';

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
import {authStack, rootSwitch, mainStack} from '../config/navigator';

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
  const [user, setUser] = useState(null);
  const [isModal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalName, setModalName] = useState('');
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
            const {weekName, ketchenMemo, hasFeedback, isDeleted, writtenAt} = doc.data();
            arr.push({
              id: doc.id,
              weekName,
              ketchenMemo,
              hasFeedback,
              isDeleted,
              writtenAt,
            });
          });
        dispatch({type: FETCH_WEEKLY_CHECK_SUCCESS, payload: arr});
      });
    } catch (e) {
      dispatch({type: FETCH_WEEKLY_CHECK_ERROR, payload: e});
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    console.log('ss', subscriber);
    return subscriber; // unsubscribe on unmount
  }, []);

  // useEffect(() => {
  //   fetchData();
  // }, [checkList, weeklyCheck]);

  const removeItem = product_id => {
    dispatch(removeWishList(product_id));
  };

  const onModal = (title, name) => {
    setModalTitle(title);
    setModalName(name);
    setModal(!isModal);
  };

  const renderData = data => {
    if (!data) {
      return (
        <Empty
          icon="heart"
          title={'데이터가 없습니다.'}
          titleButton={'로그인 페이지로 가기'}
          clickButton={() => navigation.navigate(authStack.login)}
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
            onModal={onModal}
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

  if (initializing) return null;

  if (!user) {
    NavigationServices.navigate(rootSwitch.auth, {screen: authStack.login});
  }

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
          title={'생성'}
          containerStyle={styles.marginBottom('big')}
          onPress={() => onModal('생성', null)}
        />
      </Container>
      <Modal
        visible={isModal}
        transparent
        setModalVisible={value => setModal(value)}
        ratioHeight={0.3}
        title={modalTitle}>
        <Container>
          <View style={styles.marginBottom('small')}>
            <Input
              label={modalName || '예) 3월 1주차...'}
              multiline
              numberOfLines={1}
              value={''}
              onChangeText={value => this.setState({review: value})}
            />
          </View>
          <Button
            loading={false}
            title={'저장'}
            containerStyle={styles.marginBottom('big')}
            onPress={()=>{}}
          />
        </Container>
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
