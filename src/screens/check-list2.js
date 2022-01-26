import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {sortBy, merge, includes} from 'lodash';
import {StyleSheet, FlatList, View} from 'react-native';
import {Row, Col} from 'src/containers/Gird';
import {Header, Icon, ThemedView, Text, Modal} from 'src/components';
import Input from 'src/containers/input/Input';
import InputBasic from 'src/containers/input/InputBasic';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import CheckListItem from './check-list-item';
import {TextHeader, SaveIcon, IconHeader} from 'src/containers/HeaderComponent';
import {grey4, grey6} from 'src/components/config/colors';

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
  checkListSelector,
} from 'src/modules/firebase/selectors';

const stateSelector = createStructuredSelector({
  loading: loadingListSelector(),
  checkList: checkListSelector(),
});

import {margin, padding} from 'src/components/config/spacing';

const CheckListScreen = props => {
  const {route} = props;
  const fId = route.params.item.id;
  const dispatch = useDispatch();
  const [checkItems, setCheckItems] = useState({
    개인위생: {},
    식재관리: {},
    조리장위생: {},
  });
  const [title0, setTitle0] = useState('');
  const [title1, setTitle1] = useState('');
  const [title2, setTitle2] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const {loading, checkList} = useSelector(stateSelector);
  const [isModal, setModal] = useState(false);
  const kitchenRef = firestore()
    .collection('weeklyCheck')
    .doc(route.params.item.id)
    .collection('kitchen');
  let arr0 = [];
  let arr1 = [];
  let arr2 = [];
  let total = [];

  const onChecked = async ck => {
    console.log('ck: ', ck);
    let selected = '식재관리';
    if (includes(ck, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(ck, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(ck, 'kitchen')) {
      selected = '조리장위생';
    }
    console.log('s00', checkItems[selected]);
    const checked = !checkItems[selected][ck];
    const newCheckItem = {
      ...checkItems,
      [selected]: {...checkItems[selected], [ck]: checked},
    };

    try {
      dispatch({type: CHANGE_CHECK_LIST, payload: ck});
      await kitchenRef.doc('checklist').set(newCheckItem);
      await setCheckItems(newCheckItem);
    } catch (e) {
      console.log('e', e);
    }
  };

  const onModal = (title, name) => {
    // setModalTitle(title);
    // setModalName(name);
    setModal(!isModal);
  };

  const fetchKitchenList = async () => {
    try {
      // setLoading(true);
      await kitchenRef.get().then(documentSnapshot => {
        const feedback = documentSnapshot.docs[1].data();
        console.log('feedback: ', feedback);
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
        setCheckItems(documentSnapshot.docs[0].data());
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
    dispatch({type: FETCH_CHECK_LIST});
    try {
      // let ii = 0;
      // ii++;
      // console.log(ii);
      // setLoading(true);
      const ref = firestore().collection('checklist').doc('checkItems');
      await ref.onSnapshot(documentSnapshot => {
        if (documentSnapshot !== null) {
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
          // console.log('data2', documentSnapshot);
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
          // console.log('data3', documentSnapshot);
          arr1 = sortBy(arr1, function (o) {
            return Number(o.checkName.replace('ingredient', ''));
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
          total = arr0.concat(arr1, arr2);
          dispatch({type: FETCH_CHECK_LIST_SUCCESS, payload: total});
        }
      });
    } catch (e) {
      dispatch({type: FETCH_CHECK_LIST_ERROR, payload: e});
    }
  };

  useEffect(() => {
    fetchCheckList();
    fetchKitchenList();
  }, [dispatch]);

  const itemNotification = ({item}) => {
    if (item.checkName === 'hygiene0') {
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
              onPress={onModal}
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
          <CheckListItem
            item={item}
            fId={fId}
            style={{height: 30}}
            onChecked={() => onChecked(item.checkName)}
          />
        </>
      );
    } else if (item.checkName === 'ingredient0') {
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
              onPress={onModal}
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
          <CheckListItem
            item={item}
            fId={fId}
            style={{height: 30}}
            onChecked={() => onChecked(item.checkName)}
          />
        </>
      );
    } else if (item.checkName === 'kitchen0') {
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
              onPress={onModal}
              underlayColor={'transparent'}
              containerStyle={{paddingRight: 10, paddingTop: 10}}
              // style={{paddingRight: 100}}
            />
          </Row>
          <CheckListItem
            item={item}
            fId={fId}
            style={{height: 30}}
            onChecked={() => onChecked(item.checkName)}
          />
        </>
      );
    } else {
      return (
        <CheckListItem
          item={item}
          fId={fId}
          style={{height: 30}}
          onChecked={() => onChecked(item.checkName)}
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
          numberOfLines={8}
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
  return (
    <ThemedView isFullView>
      <Header
        leftComponent={<IconHeader />}
        centerComponent={<TextHeader title={route.params.item.weekName} />}
        // centerComponent={<TextHeader title={route.params.weekName} />}
        rightComponent={<SaveIcon />}
      />
      <FlatList
        data={checkList}
        keyExtractor={item => `${item.checkName}`}
        renderItem={itemNotification}
        ListFooterComponentStyle={<View style={styles.footer} />}
        ListFooterComponent={footer}
      />
      <Modal
        visible={isModal}
        transparent
        setModalVisible={value => setModal(value)}
        ratioHeight={0.5}
        title={'체크 아이템 내용 추가'}>
        <Container>
          <View style={styles.marginBottom('small')}>
            <Input
              label={'아이템 내용을 기입해주세요.'}
              multiline
              numberOfLines={8}
              value={'feedbackDesc'}
              onChangeText={value => {}}
            />
          </View>
          <Button
            loading={false}
            title={'추가'}
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
    marginBottom: margin.large,
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
});

export default CheckListScreen;
