import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {sortBy, merge, includes} from 'lodash';
import {StyleSheet, ActivityIndicator, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import Empty from 'src/containers/Empty';
import {Row, Col} from 'src/containers/Gird';
import {Header, Icon, ThemedView, Text, Modal} from 'src/components';
import Input from 'src/containers/input/Input';
import InputBasic from 'src/containers/input/InputBasic';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import ButtonSwiper from 'src/containers/ButtonSwiper';
import ButtonLeftSwiper from 'src/containers/ButtonLeftSwiper';
import CheckListItem from './check-list-item';
import {TextHeader, SaveIcon, IconHeader} from 'src/containers/HeaderComponent';
import {grey4, grey6, blue} from 'src/components/config/colors';
import {handleError} from 'src/utils/error';

// import {fetchChecklist} from 'src/modules/firebase/actions';
import {
  FETCH_CHECK_LIST,
  FETCH_CHECK_LIST_SUCCESS,
  FETCH_CHECK_LIST_ERROR,
  CHANGE_CHECK_FEEDBACK,
  CHANGE_CHECK_LIST,
  CHANGE_CHECK_LIST_ERROR,
} from 'src/modules/firebase/constants';

import {
  loadingListSelector,
  loadingCheckListSelector,
  checkListSelector,
} from 'src/modules/firebase/selectors';

const stateSelector = createStructuredSelector({
  loading: loadingListSelector(),
  loading2: loadingCheckListSelector(),
  checkList: checkListSelector(),
});

import {margin, padding} from 'src/components/config/spacing';

const CheckListScreen = props => {
  const {route} = props;
  const fId = route.params.item.id;
  const dispatch = useDispatch();
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
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [newName, setNewName] = useState('');
  const {loading, loading2, checkList} = useSelector(stateSelector);
  const [isModal, setModal] = useState('');
  const [pending, setPending] = useState(false);
  const kitchenRef = firestore()
    .collection('weeklyCheck')
    .doc(route.params.item.id)
    .collection('kitchen');
  const checklistRef = firestore().collection('checklistClone').doc('checkItems');
  const onChecked = async ck => {
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
      dispatch({type: CHANGE_CHECK_LIST, payload: ck});
      await kitchenRef.doc('checklist').set(newCheckItem);
      await setKitchenCheckItems(newCheckItem);
    } catch (e) {
      console.log('e', e);
    }
  };

  const onModal = type => {
    console.log('type: ', type);
    // type: new, title, item
    setModal(type);
  };

  const fetchKitchenList = async () => {
    try {
      // setLoading(true);
      await kitchenRef.get().then(documentSnapshot => {
        const feedback = documentSnapshot.docs[1].data();
        const obj = merge(
          feedback['개인위생'],
          feedback['식재관리'],
          feedback['조리장위생'],
        );
        for (const item in obj) {
          dispatch({
            type: CHANGE_CHECK_FEEDBACK,
            payload: {name: item, value: obj[item]},
          });
        }

        // chkeck in checked
        setKitchenCheckItems(documentSnapshot.docs[0].data());

        for (const item in documentSnapshot.docs[0].data()['개인위생']) {
          const value = documentSnapshot.docs[0].data()['개인위생'][item];
          if (value === true) {
            dispatch({type: CHANGE_CHECK_LIST, payload: item});
          }
          if (item === 'title') {
            setTitle0(value);
          }
        }

        for (const item in documentSnapshot.docs[0].data()['식재관리']) {
          let value = documentSnapshot.docs[0].data()['식재관리'][item];
          if (value === true) {
            dispatch({type: CHANGE_CHECK_LIST, payload: item});
          }
          if (item === 'title') {
            setTitle1(value);
          }
        }

        for (const item in documentSnapshot.docs[0].data()['조리장위생']) {
          let value = documentSnapshot.docs[0].data()['조리장위생'][item];
          if (value === true) {
            dispatch({type: CHANGE_CHECK_LIST, payload: item});
          }
          if (item === 'title') {
            setTitle2(value);
          }
        }

        return documentSnapshot;
      });
    } catch (e) {
      dispatch({type: CHANGE_CHECK_LIST_ERROR, payload: e});
    }
  };

  const fetchCheckList = async () => {
    let arr0 = [];
    let arr1 = [];
    let arr2 = [];
    let total = [];
    dispatch({type: FETCH_CHECK_LIST});
    try {
      await checklistRef.get().then(documentSnapshot => {
        if (documentSnapshot !== null) {
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
          });
          total = arr0.concat(arr1, arr2);
          dispatch({type: FETCH_CHECK_LIST_SUCCESS, payload: total});
        }
      });
    } catch (e) {
      dispatch({type: FETCH_CHECK_LIST_ERROR, payload: e});
    }
  };

  const modifyData = async (item, value) => {
    dispatch({type: FETCH_CHECK_LIST});
    // setPending(true);
    let selected = '식재관리';
    if (includes(item.checkName, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(item.checkName, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(item.checkName, 'kitchen')) {
      selected = '조리장위생';
    }

    try {
      // dispatch({type: CHANGE_CHECK_LIST, payload: item.checkName});
      await checklistRef.update({
        [selected]: {
          ...checkItems[selected],
          [item.checkName]: value,
        },
      });
      fetchCheckList();
    } catch (e) {
      dispatch({type: FETCH_CHECK_LIST_ERROR});
      console.log('e', e);
    }
  };

  const deleteData = async item => {
    dispatch({type: FETCH_CHECK_LIST});
    // setPending(true);
    let selected = '식재관리';
    if (includes(item.checkName, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(item.checkName, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(item.checkName, 'kitchen')) {
      selected = '조리장위생';
    }

    try {
      // dispatch({type: CHANGE_CHECK_LIST, payload: item.checkName});
      await checklistRef.update({
        [selected]: {
          ...checkItems[selected],
          [item.checkName]: 'clear-' + item.value,
        },
      });
      fetchCheckList();
    } catch (e) {
      dispatch({type: FETCH_CHECK_LIST_ERROR});
      console.log('e', e);
    }
  };

  useEffect(() => {
    fetchCheckList();
    fetchKitchenList();
  }, [dispatch]);

  const itemList = (item, index) => {
    // console.log('checkList: ', checkList);
    if (item.checkName === 'hygiene-1') {
      return (
        <>
          <Row style={styles.row}>
            <Col>
              <InputBasic
                style={styles.inputName}
                value={title0 || '키친-개인위생'}
                onChangeText={value => setTitle0(value)}
              />
            </Col>
            <Icon
              size={22}
              type="font-awesome"
              name={'plus-circle'}
              color={grey4}
              onPress={() => onModal('new')}
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
        </>
      );
    } else if (item.checkName === 'ingredient-1') {
      return (
        <>
          <Row style={styles.row}>
            <Col>
              <InputBasic
                style={styles.inputName}
                value={title1 || '키친-식재관리'}
                onChangeText={value => setTitle1(value)}
              />
            </Col>
            <Icon
              size={22}
              type="font-awesome"
              name={'plus-circle'}
              color={grey4}
              onPress={() => onModal('edit')}
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
        </>
      );
    } else if (item.checkName === 'kitchen-1') {
      return (
        <>
          <Row style={styles.row}>
            <Col>
              <InputBasic
                style={styles.inputName}
                value={title2 || '키친-조리장위생'}
                onChangeText={value => setTitle2(value)}
              />
            </Col>
            <Icon
              size={22}
              type="font-awesome"
              name={'plus-circle'}
              color={grey4}
              onPress={() => onModal('title')}
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
        </>
      );
    } else {
      return (
        <CheckListItem
          key={index}
          item={item}
          fId={fId}
          style={{height: 30}}
          onChecked={() => onChecked(item.checkName)}
          onEdit={modifyData}
          onModal={onModal}
        />
      );
    }
  };

  const footer = (
    <Container style={styles.container}>
      <View>
        <Input
          label={'피드백을 여기에 작성해 주세요.'}
          multiline
          numberOfLines={3}
          value={feedbackDesc}
          onChangeText={value => setFeedbackDesc(value)}
        />
      </View>
      <Button
        loading={false}
        title={'저장'}
        containerStyle={styles.marginBottom('big')}
        onPress={()=>{}}
      />
    </Container>
  );

  const renderData = data => (
    <SwipeListView
      // useFlatList
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
        rightComponent={<SaveIcon />}
      />
      {/* {loading || loading2 ? (
        <View style={styles.viewLoading}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        renderData(checkList)
      )} */}
      {renderData(checkList)}
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
              value={newName}
              onChangeText={value => setNewName(value)}
            />
          </View>
          <Button
            loading={false}
            title={'추가'}
            containerStyle={styles.marginBottom('big')}
            onPress={()=>{}
            // editItem()
            }
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
  textName: {
    lineHeight: 40,
  },
  inputName: {
    lineHeight: 26,
    // height: 10,
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
