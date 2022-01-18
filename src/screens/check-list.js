import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import sortBy from 'lodash/sortBy';
import {StyleSheet, FlatList, View} from 'react-native';
import {Row, Col} from 'src/containers/Gird';
import {Header, Icon, ThemedView, Text} from 'src/components';
import CheckListItem from './check-list-item';
import {TextHeader, CartIcon, IconHeader} from 'src/containers/HeaderComponent';
import {grey4, grey6} from 'src/components/config/colors';

// import {fetchChecklist} from 'src/modules/firebase/actions';
import {FETCH_CHECK_LIST, FETCH_CHECK_LIST_SUCCESS, FETCH_CHECK_LIST_ERROR} from 'src/modules/firebase/constants';

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
  const dispatch = useDispatch();
  const {loading, checkList} = useSelector(stateSelector);
  const [data, setData] = useState([]);
  // const [loading, setLoading] = useState(false);
  let arr0 = [];
  let arr1 = [];
  let arr2 = [];
  let total = [];

  const onChecked = ck => {
    data.forEach((item, i) => {
      if (item.checkName === ck) {
        data[i].checked = !item.checked;
        setData([...data]);
      }
    });
  };

  const getCheckList = product_id => {
    dispatch(removeWishList(product_id));
  };

  const fetchKitchenList = async () => {
    console.log('run kitchen');
    try {
      // setLoading(true);
      let idx = [];
      const ref = firestore()
        .collection('weeklyCheck')
        .doc(route.params.item.id)
        .collection('kitchen');
      // console.log('ref', ref);
      await ref.get().then(documentSnapshot => {
        // chkeck in checked
        for (const item in documentSnapshot.docs[0].data()['개인위생']) {
          let value = documentSnapshot.docs[0].data()['개인위생'][item];
          console.log('value', value);
          if (value === true) {
            idx.push(total.findIndex(v => v.checkName === item));
          }
        }

        for (const item in documentSnapshot.docs[0].data()['식재관리']) {
          let value = documentSnapshot.docs[0].data()['식재관리'][item];
          console.log('value2', value);
          if (value === true) {
            idx.push(total.findIndex(v => v.checkName === item));
          }
        }

        for (const item in documentSnapshot.docs[0].data()['조리장위생']) {
          let value = documentSnapshot.docs[0].data()['조리장위생'][item];
          console.log('value3', value);
          if (value === true) {
            idx.push(total.findIndex(v => v.checkName === item));
          }
        }

        return documentSnapshot;
      });
      console.log('idx', idx);
      // idx.map(i => {
      //   total[i].checked = true;
      // });
      console.log('data', data);
      // setData(newTotal);
      // setLoading(false);
    } catch (error) {
      // setLoading(false);
    }
  };

  const fetchCheckList = async () => {
    dispatch({type: FETCH_CHECK_LIST});
    try {
      // setLoading(true);
      const ref = firestore().collection('checklist').doc('checkItems');
      await ref.onSnapshot(documentSnapshot => {
        for (const item in documentSnapshot.data()['개인위생']) {
          let value = documentSnapshot.data()['개인위생'][item];
          arr0.push({
            checkName: item,
            value: value,
            checked: false,
          });
        }
        arr0 = sortBy(arr0, function (o) {
          return Number(o.checkName.replace('hygiene', ''));
        });

        for (const item in documentSnapshot.data()['식재관리']) {
          let value = documentSnapshot.data()['식재관리'][item];
          arr1.push({
            checkName: item,
            value: value,
            checked: false,
          });
        }

        arr1 = sortBy(arr1, function (o) {
          return Number(o.checkName.replace('ingredient', ''));
        });
        for (const item in documentSnapshot.data()['조리장위생']) {
          let value = documentSnapshot.data()['조리장위생'][item];
          arr2.push({
            checkName: item,
            value: value,
            checked: false,
          });
        }
        // documentSnapshot.data()['개인위생'].forEach(doc => {
        //   console.log('doc', doc);
        // })
        arr2 = sortBy(arr2, function (o) {
          return Number(o.checkName.replace('kitchen', ''));
        });
        total = arr0.concat(arr1, arr2);
        // console.log('1', arr0, '2', arr1);
        setData(total);
        dispatch({type: FETCH_CHECK_LIST_SUCCESS, payload: total});
      });
      // setLoading(false);
    } catch (e) {
      dispatch({type: FETCH_CHECK_LIST_SUCCESS, payload: e});
      // setLoading(false);
    }
  };

  useEffect(() => {
    console.log('run check list');
    fetchCheckList();
    fetchKitchenList();
  }, []);

  const itemNotification = ({item}) => {
    if (loading === false && item.checkName === 'hygiene0') {
      return (
        <Row style={styles.row}>
          <Col>
            <Text style={styles.textName}>키친-개인위생</Text>
            {/* <Rating size={12} startingValue={data.rating} readonly /> */}
          </Col>
          <Icon
            size={19}
            type="font-awesome"
            name={'plus-circle'}
            color={grey4}
            // onPress={wishListAction}
            underlayColor={'transparent'}
            containerStyle={{paddingRight: 10, paddingTop: 5}}
            // style={{paddingRight: 100}}
          />
        </Row>
      );
    } else if (item.checkName === 'ingredient0') {
      return (
        <Row style={styles.row}>
          <Col>
            <Text style={styles.textName}>키친-식재위생</Text>
            {/* <Rating size={12} startingValue={data.rating} readonly /> */}
          </Col>
          <Icon
            size={19}
            type="font-awesome"
            name={'plus-circle'}
            color={grey4}
            // onPress={wishListAction}
            underlayColor={'transparent'}
            containerStyle={{paddingRight: 10, paddingTop: 5}}
            // style={{paddingRight: 100}}
          />
        </Row>
      );
    } else if (item.checkName === 'kitchen0') {
      return (
        <Row style={styles.row}>
          <Col>
            <Text style={styles.textName}>키친-조리장위생</Text>
            {/* <Rating size={12} startingValue={data.rating} readonly /> */}
          </Col>
          <Icon
            size={19}
            type="font-awesome"
            name={'plus-circle'}
            color={grey4}
            // onPress={wishListAction}
            underlayColor={'transparent'}
            containerStyle={{paddingRight: 10, paddingTop: 5}}
            // style={{paddingRight: 100}}
          />
        </Row>
      );
    } else {
      return (
        <CheckListItem
          data={item}
          setData={setData}
          style={{height: 30}}
          onChecked={() => onChecked(item.checkName)}
        />
      );
    }
  };

  return (
    <ThemedView isFullView>
      <Header
        leftComponent={<IconHeader />}
        centerComponent={<TextHeader title={route.params.item.weekName} />}
        // centerComponent={<TextHeader title={route.params.weekName} />}
        rightComponent={<CartIcon />}
      />
      <FlatList
        data={data}
        keyExtractor={item => `${item.checkName}`}
        renderItem={itemNotification}
        ListFooterComponentStyle={<View style={styles.footer} />}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom: margin.big,
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
    lineHeight: 30,
  },
  row: {
    flexDirection: 'row',
    marginLeft: 0,
    marginRight: 0,
    marginBottom: margin.large,
    backgroundColor: grey6,
    height: 30,
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
});

export default CheckListScreen;
