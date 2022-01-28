import React, {useState, useEffect} from 'react';
import {utils} from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useNavigation} from '@react-navigation/native';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {View, ScrollView, Image, KeyboardAvoidingView} from 'react-native';
import {sortBy, merge, includes} from 'lodash';
import {Header, Text, ThemedView} from 'src/components';
import {Row, Col} from 'src/containers/Gird';
import CheckBox from 'src/components/checkbox/CheckBox';
import Input from 'src/containers/input/Input';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import ChooseItem from 'src/containers/ChooseItem';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';
import {grey4, grey6} from 'src/components/config/colors';

import {
  CHANGE_CHECK_LIST,
  CHANGE_CHECK_LIST_SUCCESS,
  CHANGE_CHECK_LIST_ERROR,
  CHANGE_CHECK_FEEDBACK,
} from 'src/modules/firebase/constants';

import {
  loadingCheckListSelector,
  checkListSelector,
} from 'src/modules/firebase/selectors';

import {margin} from 'src/components/config/spacing';

const stateSelector = createStructuredSelector({
  loading: loadingCheckListSelector(),
  checkList: checkListSelector(),
});

const FeedbackScreen = props => {
  const {item, fId, kitchenCheckItems} = props.route.params || '';
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {loading, checkList} = useSelector(stateSelector);
  const [checked, setChecked] = useState(item.checked);
  const [feedback, setFeedback] = useState(item.feedback);
  const [imageUrl, setImageUrl] = useState([]);

  const weeklyRef = firestore().collection('weeklyCheck').doc(fId);
  // const stoageRef = storage().collection('feedbackImage').get();
  // 8XjzdZaOwb6kuSKF9bwx
  const stoageRef = storage().ref('feedbackImage').list({fId}).then(
    result => {
      // result.items.forEach(ref => {
      //   console.log(ref.fullPath);
      // })
      console.log('r', result);
      console.log('ttt', result.nextPageToken);
    }
  );
  // console.log('ss', stoageRef);

  let defaultImage = '';
  const onChecked = async () => {
    dispatch({type: CHANGE_CHECK_LIST});
    let selected = '식재관리';
    if (includes(item.checkName, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(item.checkName, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(item.checkName, 'kitchen')) {
      selected = '조리장위생';
    }
    // const checked = !kitchenCheckItems[selected][ck];

    const newCheckItem = {
      ...kitchenCheckItems,
      [selected]: {
        ...kitchenCheckItems[selected],
        [item.checkName]: !item.checked,
      },
    };

    try {
      dispatch({
        type: CHANGE_CHECK_LIST_SUCCESS,
        payload: {name: item.checkName, value: !item.checked},
      });
      await weeklyRef
        .collection('kitchen')
        .doc('checklist')
        .update(newCheckItem);
      // setKitchenCheckItems(newCheckItem);
      setChecked(!checked);
    } catch (e) {
      dispatch({type: CHANGE_CHECK_LIST_ERROR, payload: e});
      console.log('e', e);
    }
  };

  const onFeedback = async () => {
    dispatch({type: CHANGE_CHECK_LIST});
    let selected = '식재관리';
    if (includes(item.checkName, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(item.checkName, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(item.checkName, 'kitchen')) {
      selected = '조리장위생';
    }
    // const checked = !kitchenCheckItems[selected][ck];

    try {
      dispatch({
        type: CHANGE_CHECK_FEEDBACK,
        payload: {name: item.checkName, value: feedback},
      });
      const totalFeedback = await weeklyRef
        .collection('kitchen')
        .doc('feedback')
        .get()
        .then(documentSnapshot => documentSnapshot.data());

      const newFeedback = await {
        ...totalFeedback,
        [selected]: {
          ...totalFeedback[selected],
          [item.checkName]: feedback,
        },
      };

      await weeklyRef.collection('kitchen').doc('feedback').update(newFeedback);
      await weeklyRef.update({hasFeedback: true});
    } catch (e) {
      dispatch({type: CHANGE_CHECK_LIST_ERROR, payload: e});
      console.log('e', e);
    }
  };

  const fetchImage = async () => {
    const {checkName} = item;
    // const media = '/feedbackImage/50297A9880424B81982/kitchen/ingredient7.jpg';
    const media = '/feedbackImage/50297A98-8042-4B81-9828-E59F7E3E18CD/kitchen/unnamed.jpg';
    const media2 = '/feedbackImage/50297A98-8042-4B81-9828-E59F7E3E18CD/kitchen/ingredient7.jpg';
    const mediaUri = '/feedbackImage/50297A9880424B81982/kitchen/';
    const ref = await storage().ref(media);
    const ref2 = await storage().ref(media2);
    const defaultImage = await ref.getDownloadURL();
    const defaultImage2 = await ref2.getDownloadURL();
    const arr = [defaultImage, defaultImage2];
    setImageUrl(arr);
    // const task = ref.putFile(media);

    // task.then(async () => {
    //   defaultImage = await ref.getDownloadURL();
    // });
    // const pathToFile = `${utils.FilePath.PICTURES_DIRECTORY/sda.jpg}`;
    // // 50297A98-8042-4B81-982
    // console.log('p', pathToFile);
    // try {
    //   const ref = firestore()
    //     .collection('weeklyCheck')
    //     .doc(route.params.item.id)
    //     .collection('feedback');
    //   await ref.get().then(documentSnapshot => {
    //     // chkeck in checked
    //     for (const item in documentSnapshot.docs[0].data()['개인위생']) {
    //       let value = documentSnapshot.docs[0].data()['개인위생'][item];
    //       console.log('value', value);
    //       // if (value === true) {
    //       //   dispatch({type: CHANGE_CHECK_LIST, payload: item});
    //       // }
    //     }
    //     return documentSnapshot;
    //   });
    // } catch (e) {
    //   // dispatch({type: FETCH_CHECK_ERROR, payload: e});
    // }
  };

  useEffect(() => {
    fetchImage();
  }, [])

  const topElement = (
    <Image
      source={{uri: imageUrl[0]}}
      style={[styles.image, styles.marginBottom('small')]}
      resizeMode="stretch"
    />
  );

  return (
    <ThemedView isFullView>
      <Header
        leftComponent={<IconHeader />}
        centerComponent={<TextHeader title={'피드백 사항'} />}
      />
      <KeyboardAvoidingView behavior="height" style={styles.keyboard}>
        <ScrollView>
          <Container>
            <View style={styles.viewContent}>
              <Row style={styles.row}>
                <CheckBox colorThird onPress={onChecked} checked={checked} />
                <Col style={styles.center}>
                  <Text medium>{item.value}</Text>
                </Col>
              </Row>
              {/* <Text medium style={styles.marginBottom('large')}>
                {item}
              </Text> */}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.scroll}>
              <Image
                source={require('src/assets/images/pDefault.png')}
                resizeMode="stretch"
                style={[styles.image, styles.marginBottom('small')]}
              />
              <Image
                source={{uri: imageUrl[0]}}
                resizeMode="stretch"
                style={[styles.image, styles.marginBottom('small')]}
              />
              <Image
                source={{uri: imageUrl[1]}}
                resizeMode="stretch"
                style={[styles.image, styles.marginBottom('small')]}
              />
              {/* <ChooseItem
                key={'1'}
                item={'1'}
                onPress={() => {}}
                active={true}
                topElement={topElement}
                containerStyle={styles.item}
              /> */}
              {/* 
              <Image
                source={require('src/assets/images/pDefault.png')}
                resizeMode="stretch"
                style={[styles.image, styles.marginBottom('small')]}
              /> */}
            </ScrollView>
            <View style={styles.marginBottom('big')}>
              <Input
                label={'피드백을 여기에 작성해 주세요.'}
                multiline
                numberOfLines={8}
                value={feedback}
                onChangeText={value => setFeedback(value)}
              />
            </View>
            <Button
              loading={false}
              title={'저장'}
              containerStyle={styles.marginBottom('big')}
              onPress={onFeedback}
            />
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = {
  container: {
    flex: 1,
    // marginBottom: margin.big,
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
    marginLeft: margin.medium,
    marginRight: margin.medium,
    marginBottom: margin.small,
  },
  scroll: {
    marginTop: margin.large,
    marginBottom: margin.large,
  },
  marginBottom: type => ({
    marginBottom: margin[type],
  }),
  keyboard: {
    flex: 1,
  },
  viewContent: {
    alignItems: 'center',
  },
  image: {
    width: 109,
    height: 128,
    marginRight: margin.large,
  },
  tab: {
    fontSize: 10,
    lineHeight: 15,
  },
  item: {
    marginRight: margin.base,
  },
};

// const mapStateToProps = state => {
//   return {
//     auth: authSelector(state),
//     dataReview: dataReviewSelector(state),
//   };
// };
export default FeedbackScreen;
