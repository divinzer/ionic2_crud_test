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
import ItemWishlist from './ItemWishlist';
import {TextHeader, CartIcon, IconHeader} from 'src/containers/HeaderComponent';
import Empty from 'src/containers/Empty';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import ButtonSwiper from 'src/containers/ButtonSwiper';
import Input from 'src/containers/input/Input';
import {handleError} from 'src/utils/error';

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

import {LogBox} from 'react-native';
LogBox.ignoreLogs(['Sending']);

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
  const [checkItems, setCheckItems] = useState({
    개인위생: {},
    식재관리: {},
    조리장위생: {},
  });
  const [user, setUser] = useState(null);
  const [isModal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [weekTitle, setWeekTitle] = useState('');
  const [selectedDoc, setSelectedDoc] = useState({id: '', weekName: ''});
  const ref = firestore()
    .collection('weeklyCheck')
    .where('isDeleted', '==', false)
    .orderBy('writtenAt', 'desc')
    .limit(8);

  const refDB = firestore().collection('weeklyCheck');

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

  const fetchCheckItems = async () => {
    try {
      const CheckItemsRef = firestore()
        .collection('checklist')
        .doc('checkItems');
      await CheckItemsRef.onSnapshot(documentSnapshot => {
        const obj = documentSnapshot.data();
        for (const item in documentSnapshot.data()['개인위생']) {
          obj['개인위생'][item] = false;
          obj['개인위생'].title = '키친 - 개인위생';
        }
        for (const item in documentSnapshot.data()['식재관리']) {
          obj['식재관리'][item] = false;
          obj['식재관리'].title = '키친 - 식재관리';
        }
        for (const item in documentSnapshot.data()['조리장위생']) {
          obj['조리장위생'][item] = false;
          obj['조리장위생'].title = '키친 - 조리장위생';
        }
        setCheckItems(obj);
      });
    } catch (e) {
      // setLoading(false);
    }
  };
  const fetchData = async () => {
    dispatch({type: FETCH_WEEKLY_CHECK});
    try {
      await ref.onSnapshot((querySnapshot, err) => {
        const arr = [];
        if (querySnapshot) {
          querySnapshot.forEach(doc => {
            const {weekName, kitchenMemo, hasFeedback, isDeleted, writtenAt} = doc.data();
            arr.push({
              id: doc.id,
              weekName,
              kitchenMemo,
              hasFeedback,
              isDeleted,
              writtenAt,
            });
          });
          dispatch({type: FETCH_WEEKLY_CHECK_SUCCESS, payload: arr});
        } else {
          dispatch({type: FETCH_WEEKLY_CHECK_ERROR, payload: ''});
        }
      });
    } catch (e) {
      dispatch({type: FETCH_WEEKLY_CHECK_ERROR, payload: e});
      // setLoading(false);
    }
  };

  const createData = async () => {
    try {
      // const batch = firestore().batch();
      if (modalTitle === '생성' && weekTitle) {
        const doc = await refDB.add({
          weekName: weekTitle,
          kitchenMemo: '',
          hasFeedback: false,
          isDeleted: false,
          writtenAt: Date(),
          kitchen: [],
        });
        const feedbackItem = {개인위생: {}, 식재관리: {}, 조리장위생: {}};
        const firstDoc = await doc.collection('kitchen').add({});
        await doc.collection('kitchen').doc('checklist').set(checkItems);
        await doc.collection('kitchen').doc('feedback').set(feedbackItem);
        await firstDoc.delete();
        setModal(false);
        setWeekTitle('');
        fetchData();
      }
    } catch (e) {
      handleError({
        message: '새로운 항목 생성이 실패했습니다. 관리자에게 문의 바랍니다.',
      });
    }
  };

  const modifyData = async () => {
    try {
      let doc = {...selectedDoc};
      doc.weekName = weekTitle;
      if (modalTitle === '주차이름 변경' && weekTitle) {
        await refDB.doc(selectedDoc.id).set(doc);
        setModal(false);
        setWeekTitle('');
        setSelectedDoc({});
        fetchData();
      }
    } catch (e) {
      handleError({
        message: `${weekTitle} 이름변경을 실패했습니다. 관리자에게 문의 바랍니다.`,
      });
    }
  };

  const deleteData = async item => {
    console.log('id: ', item);
    let data = {...item};
    data.isDeleted = true;
    try {
      // await refDB.doc(id).delete();
      await refDB.doc(item.id).update({isDeleted: true});
      setModal(false);
      setWeekTitle('');
      setSelectedDoc({});
      fetchData();
    } catch (e) {
      handleError({
        message: '삭제에 실패했습니다. 관리자에게 문의 바랍니다.',
      });
    }
  };

  useEffect(() => {
    fetchData();
    fetchCheckItems();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // useEffect(() => {
  //   fetchData();
  // }, [checkList, weeklyCheck]);

  const onModal = (title, name, doc = 0) => {
    setModalTitle(title);
    setWeekTitle(name);
    setSelectedDoc(doc);
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
          <ItemWishlist
            item={item}
            key={index}
            style={index === 0 ? styles.firstItem : undefined}
            type="wishlist"
            onModal={onModal}
          />
        )}
        renderHiddenItem={({item}) => (
          <View style={styles.viewSwiper}>
            <ButtonSwiper onPress={() => deleteData(item)} />
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
          onPress={() => onModal('생성')}
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
              label={'예) 3월 1주차...'}
              value={weekTitle}
              onChangeText={value => setWeekTitle(value)}
            />
          </View>
          <Button
            disabled={!weekTitle}
            loading={false}
            title={modalTitle === '생성' ? '저장' : '수정'}
            containerStyle={styles.marginBottom('big')}
            onPress={modalTitle === '생성' ? createData : modifyData}
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
