import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {sortBy, merge, includes} from 'lodash';
import {StyleSheet, ActivityIndicator, TouchableOpacity, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {Row, Col} from 'src/containers/Gird';
import {Header, Icon, ThemedView, Text, Modal} from 'src/components';
import Input from 'src/containers/input/Input';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import ButtonSwiper from 'src/containers/ButtonSwiper';
import ButtonLeftSwiper from 'src/containers/ButtonLeftSwiper';
import CheckListItem from './checkListItem';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';
import {grey4, grey6, blue} from 'src/components/config/colors';
import {handleError, showSuccess} from 'src/utils/error';

import {
  FETCH_CHECK_LIST,
  FETCH_CHECK_LIST_SUCCESS,
  FETCH_CHECK_LIST_ERROR,
  CHANGE_CHECK_FEEDBACK,
  CHANGE_CHECK_LIST,
  CHANGE_CHECK_LIST_SUCCESS,
  CHANGE_CHECK_LIST_ERROR,
} from 'src/modules/firebase/constants';

import {
  loadingListSelector,
  loadingCheckListSelector,
  checkListSelector,
  roleSelector,
} from 'src/modules/firebase/selectors';

const stateSelector = createStructuredSelector({
  loading: loadingListSelector(),
  loading2: loadingCheckListSelector(),
  checkList: checkListSelector(),
  role: roleSelector(),
});

import {margin, padding} from 'src/components/config/spacing';

const CheckListScreen = props => {
  const navigation = useNavigation();
  const {route} = props;
  const fId = route.params.item.id;
  // console.log('fId: ', fId);
  const weekItem = route.params.item;
  const dispatch = useDispatch();
  const {loading, loading2, checkList, role} = useSelector(stateSelector);
  const [kitchenCheckItems, setKitchenCheckItems] = useState({
    개인위생: {},
    식재관리: {},
    조리장위생: {},
  });
  const [checkItems, setCheckItems] = useState({
    개인위생: {},
    식재관리: {},
    조리장위생: {},
  });
  const [title0, setTitle0] = useState('');
  const [title1, setTitle1] = useState('');
  const [title2, setTitle2] = useState('');
  const [totalLoading, setTotalLoading] = useState(true);
  const [memo, setMemo] = useState(weekItem.kitchenMemo);
  const [selectedData, setSelectedData] = useState({name: '', order: ''});
  const [isModal, setModal] = useState('');

  const weeklyRef = firestore()
    .collection('weeklyCheckClone')
    .doc(route.params.item.id);

  const checklistRef = firestore()
    .collection('checklistClone')
    .doc('checkItems');

  const onChecked = async ck => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'});}
    dispatch({type: CHANGE_CHECK_LIST});
    let selected = '식재관리';
    if (includes(ck, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(ck, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(ck, 'kitchen')) {
      selected = '조리장위생';
    }
    const checked = !kitchenCheckItems[selected][ck];

    const newCheckItem = {
      ...kitchenCheckItems,
      [selected]: {...kitchenCheckItems[selected], [ck]: checked},
    };
    try {
      dispatch({
        type: CHANGE_CHECK_LIST_SUCCESS,
        payload: {name: ck, value: checked},
      });
      await weeklyRef
        .collection('kitchen')
        .doc('checklist')
        .update(newCheckItem);
      setKitchenCheckItems(newCheckItem);
      await fetchKitchenList();
    } catch (e) {
      dispatch({type: CHANGE_CHECK_LIST_ERROR, payload: e});
    }
  };

  const onModal = (type, data) => {
    // type: new, title, item
    setModal(type);
    setSelectedData(data);
  };

  const fetchKitchenList = async () => {
    dispatch({type: CHANGE_CHECK_LIST});
    try {
      await weeklyRef
        .collection('kitchen')
        .get()
        .then(documentSnapshot => {
          // check feedback
          if (documentSnapshot) {
            const feedback = documentSnapshot.docs[1].data();
            const obj = merge(
              feedback['개인위생'],
              feedback['식재관리'],
              feedback['조리장위생'],
            );
            for (const item in obj) {
              if (obj[item]) {
                dispatch({
                  type: CHANGE_CHECK_FEEDBACK,
                  payload: {name: item, value: obj[item]},
                });
              }
            }

            const check = documentSnapshot.docs[0].data();
            const obj2 = merge(
              check['개인위생'],
              check['식재관리'],
              check['조리장위생'],
            );
            for (const item in obj2) {
              if (obj2[item]) {
                dispatch({
                  type: CHANGE_CHECK_LIST_SUCCESS,
                  payload: {name: item, value: obj2[item]},
                });
              }
            }

            setKitchenCheckItems(documentSnapshot.docs[0].data());
            setTotalLoading(false);
          }
        });
    } catch (e) {
      dispatch({type: CHANGE_CHECK_LIST_ERROR, payload: e});
      setTotalLoading(false);
    }
  };

  const fetchCheckList = async () => {
    // setTotalLoading(true);
    let arr0 = [];
    let arr1 = [];
    let arr2 = [];
    let total = [];
    dispatch({type: FETCH_CHECK_LIST});
    try {
      await checklistRef.get().then(documentSnapshot => {
        if (documentSnapshot) {
          setCheckItems(documentSnapshot.data());
          for (const item in documentSnapshot.data()['개인위생']) {
            let value = documentSnapshot.data()['개인위생'][item];
            if (!includes(value, 'clear')) {
              arr0.push({
                checkName: item,
                value: value,
                checked: false,
                feedback: null,
              });
            }
          }
          arr0 = sortBy(arr0, function (o) {
            return Number(o.checkName.replace('hygiene', ''));
          });
          arr0.unshift({
            checkName: 'hygiene-1',
            value: '개인위생',
            checked: false,
            feedback: null,
            disableRightSwipe: true,
            disableLeftSwipe: true,
          });
          for (const item in documentSnapshot.data()['식재관리']) {
            let value = documentSnapshot.data()['식재관리'][item];
            if (!includes(value, 'clear')) {
              arr1.push({
                checkName: item,
                value: value,
                checked: false,
                feedback: null,
              });
            }
          }
          arr1 = sortBy(arr1, function (o) {
            return Number(o.checkName.replace('ingredient', ''));
          });
          arr1.unshift({
            checkName: 'ingredient-1',
            value: '',
            checked: false,
            feedback: null,
            disableRightSwipe: true,
            disableLeftSwipe: true,
          });
          for (const item in documentSnapshot.data()['조리장위생']) {
            let value = documentSnapshot.data()['조리장위생'][item];
            if (!includes(value, 'clear')) {
              arr2.push({
                checkName: item,
                value: value,
                checked: false,
                feedback: null,
              });
            }
          }
          arr2 = sortBy(arr2, function (o) {
            return Number(o.checkName.replace('kitchen', ''));
          });
          arr2.unshift({
            checkName: 'kitchen-1',
            value: '',
            checked: false,
            feedback: null,
            disableRightSwipe: true,
            disableLeftSwipe: true,
          });
          total = arr0.concat(arr1, arr2);
          dispatch({type: FETCH_CHECK_LIST_SUCCESS, payload: total});
        }
      });
      await fetchKitchenList();
    } catch (e) {
      dispatch({type: FETCH_CHECK_LIST_ERROR, payload: e});
    }
  };

  const addMemo = async () => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
    try {
      await weeklyRef.update({
        ...weekItem,
        kitchenMemo: memo,
      });
      // fetchKitchenList();
      showSuccess({
        message: '피드백이 저장되었습니다.',
      });
      if (memo) {
        await weeklyRef.update({hasFeedback: true});
      } else {
        await weeklyRef.update({hasFeedback: false});
      }
    } catch (e) {
      handleError({
        message: '피드백이 저장되지 못했습니다. 관리자에게 문의하세요',
      });
    }
  };

  const modifyData = async () => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
    let selected = '식재관리';
    if (includes(selectedData.order, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(selectedData.order, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(selectedData.order, 'kitchen')) {
      selected = '조리장위생';
    }

    try {
      isModal === 'title' &&
        (await weeklyRef
          .collection('kitchen')
          .doc('checklist')
          .update({
            [selectedData.order]: {
              ...kitchenCheckItems[selectedData.order],
              title: selectedData.name,
            },
          }));
      isModal === 'edit' &&
        (await checklistRef.update({
          [selected]: {
            ...checkItems[selected],
            [selectedData.order]: selectedData.name,
          },
        }));
      isModal === 'new' &&
        (await checklistRef.update({
          [selected]: {
            ...checkItems[selected],
            [selectedData.order]: selectedData.name,
          },
        }));
      await fetchCheckList();
      setModal('');
    } catch (e) {
      console.log('e', e);
    }
  };

  const deleteData = async item => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
    let selected = '식재관리';
    if (includes(item.checkName, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(item.checkName, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(item.checkName, 'kitchen')) {
      selected = '조리장위생';
    }

    try {
      await checklistRef.update({
        [selected]: {
          ...checkItems[selected],
          [item.checkName]: 'clear-' + item.value,
        },
      });
      await fetchCheckList();
    } catch (e) {
      console.log('e', e);
    }
  };

  useEffect(() => {
    fetchCheckList();
    const willFocusSubscription = navigation.addListener('focus', () => {
      fetchKitchenList();
    });
    return willFocusSubscription;
  }, [dispatch]);

  const itemList = item => {
    if (item.checkName === 'hygiene-1') {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={() =>
            onModal('title', {
              name: title0 || '키친-개인위생',
              order: '개인위생',
            })
          }>
          <Row style={styles.row}>
            <Col>
              <Text style={styles.inputName}>{title0 || '키친-개인위생'}</Text>
            </Col>
            <Icon
              size={22}
              type="font-awesome"
              name={'plus-circle'}
              color={grey4}
              onPress={() =>
                onModal('new', {
                  name: '',
                  order: 'hygiene' + Object.keys(checkItems['개인위생']).length,
                })
              }
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
        </TouchableOpacity>
      );
    } else if (item.checkName === 'ingredient-1') {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={() =>
            onModal('title', {
              name: title1 || '키친-식재관리',
              order: '식재관리',
            })
          }>
          <Row style={styles.row}>
            <Col>
              <Text style={styles.inputName}>{title1 || '키친-식재관리'}</Text>
            </Col>
            <Icon
              size={22}
              type="font-awesome"
              name={'plus-circle'}
              color={grey4}
              onPress={() =>
                onModal('new', {
                  name: '',
                  order: 'ingredient' + Object.keys(checkItems['식재관리']).length,
                })
              }
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
        </TouchableOpacity>
      );
    } else if (item.checkName === 'kitchen-1') {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={() =>
            onModal('title', {
              name: title2 || '키친-조리장위생',
              order: '조리장위생',
            })
          }>
          <Row style={styles.row}>
            <Col>
              <Text style={styles.inputName}>{title2 || '키친-조리장위생'}</Text>
            </Col>
            <Icon
              size={22}
              type="font-awesome"
              name={'plus-circle'}
              color={grey4}
              onPress={() =>
                onModal('new', {
                  name: '',
                  order: 'kitchen' + Object.keys(checkItems['조리장위생']).length,
                })
              }
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
        </TouchableOpacity>
      );
    } else {
      return (
        <CheckListItem
          item={item}
          fId={fId}
          style={{height: 30}}
          onChecked={() => onChecked(item.checkName)}
          onEdit={modifyData}
          onModal={onModal}
          kitchenCheckItems={kitchenCheckItems}
        />
      );
    }
  };

  const footer = (
    <Container style={styles.container}>
      <View>
        <Input
          label={'피드백'}
          multiline
          numberOfLines={3}
          value={memo}
          onChangeText={value => setMemo(value)}
        />
      </View>
      <Button
        loading={false}
        title={'피드백 저장'}
        containerStyle={styles.marginBottom('big')}
        onPress={addMemo}
      />
    </Container>
  );

  const renderData = data => (
    <SwipeListView
      useFlatList
      keyExtractor={item => item.checkName}
      data={data}
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
      renderItem={({item, index}) => itemList(item, index)}
      renderHiddenItem={({item}) => (
        <View style={styles.viewSwiper}>
          <ButtonLeftSwiper icon={'like'} onPress={() => deleteData(item.id)} />
          <ButtonSwiper onPress={() => deleteData(item)} />
        </View>
      )}
      leftOpenValue={70}
      rightOpenValue={-70}
      disableLeftSwipe={false}
      disableRightSwipe={true}
    />
  );

  // if (loading || loading2) return null;
  return (
    <ThemedView isFullView>
      <Header
        leftComponent={<IconHeader />}
        centerComponent={<TextHeader title={route.params.item.weekName} />}
        // centerComponent={<TextHeader title={route.params.weekName} />}
        // rightComponent={<SaveIcon />}
      />
      {totalLoading ? (
        <View style={styles.viewLoading}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        renderData(checkList)
      )}
      {/* {renderData(checkList)} */}
      {footer}
      <Modal
        visible={isModal === 'new' || isModal === 'title' || isModal === 'edit'}
        transparent
        setModalVisible={value => setModal(value)}
        ratioHeight={0.3}
        title={
          isModal === 'new'
            ? '체크 아이템 내용 추가'
            : isModal === 'title'
            ? '제목 수정'
            : isModal === 'edit'
            ? '항목 수정'
            : ''
        }>
        <Container>
          <View style={styles.marginBottom('small')}>
            <Input
              label={'아이템 내용을 기입해주세요.'}
              value={selectedData.name}
              onChangeText={value =>
                setSelectedData({
                  ...selectedData,
                  name: value,
                })
              }
            />
          </View>
          <Button
            loading={false}
            title={
              isModal === 'new'
                ? '추가'
                : isModal === 'title'
                ? '수정'
                : isModal === 'edit'
                ? '수정'
                : ''
            }
            containerStyle={styles.marginBottom('big')}
            onPress={modifyData}
          />
        </Container>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    marginBottom: margin.big,
  },
  item: {
    // borderWidth: 1,
    borderRadius: 0,
    // justifyContent: 'center',
    // paddingHorizontal: padding.big,
    // marginRight: margin.small,
  },
  itemFirst: {
    marginLeft: margin.large,
  },
  itemLast: {
    marginRight: margin.large,
  },
  inputName: {
    lineHeight: 40,
  },
  row: {
    flexDirection: 'row',
    marginLeft: 0,
    marginRight: 0,
    // marginBottom: margin.large,
    backgroundColor: grey6,
    height: 40,
  },
  col1: {
    // width: '95%',
    justifyContent: 'flex-start',
    paddingLeft: padding.small,
    paddingRight: padding.small,
  },
  col2: {
    justifyContent: 'flex-end',
    // width: '5%',
    paddingLeft: padding.small,
    paddingRight: padding.small,
  },
  marginBottom: type => ({
    marginBottom: margin[type],
  }),
  footer: {
    marginBottom: margin.large,
  },
  viewSwiper: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    flexDirection: 'row',
  },
  firstItem: {
    borderTopWidth: 1,
  },
});

export default CheckListScreen;
