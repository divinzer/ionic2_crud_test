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
import {handleError, showSuccess} from 'src/utils/error';

import {margin} from 'src/components/config/spacing';
import {rootSwitch} from 'src/config/navigator';

import {LogBox} from 'react-native';
LogBox.ignoreLogs(['Sending']);

import {
  FETCH_WEEKLY_CHECK,
  FETCH_WEEKLY_CHECK_SUCCESS,
  FETCH_WEEKLY_CHECK_ERROR,
} from 'src/modules/firebase/constants';

import {
  loadingListSelector,
  weeklyCheckSelector,
  roleSelector,
} from 'src/modules/firebase/selectors';

const stateSelector = createStructuredSelector({
  loading: loadingListSelector(),
  weeklyCheck: weeklyCheckSelector(),
  role: roleSelector(),
});

const WishListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {loading, weeklyCheck, role} = useSelector(stateSelector);
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
  const weeklyRef = firestore()
    .collection('weeklyCheck')
    .where('isDeleted', '==', false)
    .orderBy('writtenAt', 'desc')
    .limit(8);

  const checklistRef = firestore().collection('weeklyCheck');
  let willFocusSubscription = null;
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
      const checkItemsRef = await firestore()
        .collection('checklist')
        .doc('checkItems');
      checkItemsRef.onSnapshot(documentSnapshot => {
        if (documentSnapshot) {
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
        }
      });
    } catch (e) {
      // setLoading(false);
    }
  };
  const fetchData = async () => {
    dispatch({type: FETCH_WEEKLY_CHECK});
    try {
      await weeklyRef.onSnapshot((querySnapshot, err) => {
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
        }
      });
    } catch (e) {
      dispatch({type: FETCH_WEEKLY_CHECK_ERROR, payload: e});
      // setLoading(false);
    }
  };

  const createData = async () => {
    console.log('role', role);
    if (role === 'admin' || !role) { return handleError({message: '권한이 없습니다.'});}
    try {
      // const batch = firestore().batch();
      if (modalTitle === '생성' && weekTitle) {
        const doc = await checklistRef.add({
          weekName: weekTitle,
          kitchenMemo: '',
          hasFeedback: false,
          isDeleted: false,
          writtenAt: Date(),
        });
        const feedbackItem = {개인위생: {}, 식재관리: {}, 조리장위생: {}};
        const firstDoc = await doc.collection('kitchen').add({});
        await doc.collection('kitchen').doc('checklist').set(checkItems);
        await doc.collection('kitchen').doc('feedback').set(feedbackItem);
        await firstDoc.delete();
        setModal(false);
        setWeekTitle('');
        fetchData();
        showSuccess({
          message: '새로운 리스트가 생성되었습니다.',
        });
      }
    } catch (e) {
      handleError({
        message: '새로운 항목 생성이 실패했습니다. 관리자에게 문의 바랍니다.',
      });
    }
  };

  const modifyData = async () => {
    if (role === 'admin' || !role) { return handleError({message: '권한이 없습니다.'});}
    try {
      let doc = {...selectedDoc};
      doc.weekName = weekTitle;
      if (modalTitle === '주차이름 변경' && weekTitle) {
        await checklistRef.doc(selectedDoc.id).set(doc);
        setModal(false);
        setWeekTitle('');
        setSelectedDoc({});
        fetchData();
      } else {
        await checklistRef.doc(selectedDoc.id).update({...doc, weekName: weekTitle});
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
      // await checklistRef.doc(id).delete();
      await checklistRef.doc(item.id).update({isDeleted: true});
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

  useEffect(() => {
    willFocusSubscription = navigation.addListener('focus', () => {
      fetchData();
    });
    return willFocusSubscription;
  }, [navigation]);

  const removeListener = () => {
    willFocusSubscription.remove();
  };

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
          clickButton={() => navigation.navigate(rootSwitch.login)}
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

  // if (!user) {
  //   NavigationServices.navigate(rootSwitch.auth, {screen: rootSwitch.login});
  // }

  if (initializing) return null;

  return (
    <ThemedView style={styles.container}>
      <Header
        centerComponent={<TextHeader title={'위생점검 리스트'} />}
        rightComponent={<CartIcon removeListener={removeListener} />}
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
