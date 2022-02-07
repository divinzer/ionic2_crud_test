import React, {useState, useEffect} from 'react';
// import {utils} from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
// import {useNavigation} from '@react-navigation/native';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {
  View,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import imageCompress from 'react-native-compressor';
import {launchImageLibrary} from 'react-native-image-picker';
import {includes} from 'lodash';
import {Header, Text, ThemedView} from 'src/components';
import {Row, Col} from 'src/containers/Gird';
import CheckBox from 'src/components/checkbox/CheckBox';
import Input from 'src/containers/input/Input';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import ChooseItem from 'src/containers/ChooseItem';
import {
  TextHeader,
  IconHeader,
  ShareIcon,
} from 'src/containers/HeaderComponent';
import {grey4, grey6} from 'src/components/config/colors';
import {handleError, showSuccess} from 'src/utils/error';
import {margin} from 'src/components/config/spacing';

import {
  CHANGE_CHECK_LIST,
  CHANGE_CHECK_LIST_SUCCESS,
  CHANGE_CHECK_LIST_ERROR,
  CHANGE_CHECK_FEEDBACK,
} from 'src/modules/firebase/constants';

import {roleSelector} from 'src/modules/firebase/selectors';

const stateSelector = createStructuredSelector({
  role: roleSelector(),
});

const FeedbackScreen = props => {
  const {item, fId, kitchenCheckItems} = props.route.params || '';
  // console.log('item: ', item);
  // const navigation = useNavigation();
  const dispatch = useDispatch();
  const {role} = useSelector(stateSelector);
  const [checked, setChecked] = useState(item.checked);
  const [feedback, setFeedback] = useState(item.feedback);
  const [imagesUrl, setImagesUrl] = useState([]);
  const [selectedM, selectMethod] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadTaskSnapshot, setUploadTaskSnapshot] = useState({});
  const weeklyRef = firestore().collection('weeklyCheckClone').doc(fId);
  const stoageRef = storage().ref(
    `feedbackImage/${fId}/kitchen/${item.checkName}`,
  );
  let base64Arr = [];

  // for Image Upload
  const onMediaUpload = async media => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
    try {
      if (!media.didCancel) {
        // Upload Process
        setUploading(true);
        const result = await imageCompress.Image.compress(media.assets[0].uri, {
          maxWidth: 1024,
          quality: 0.8,
        });
        const reference = storage().ref(
          `feedbackImage/${fId}/kitchen/${item.checkName}/${media.assets[0].fileName}`,
        );
        const task = reference.putFile(result);
        task.on('state_changed', taskSnapshot => {
          setUploadTaskSnapshot(taskSnapshot);
        });
        task.then(() => {
          fetchImages();
          setUploading(false);
        });
      }
    } catch (e) {
      setUploading(false);
      handleError({
        message: '파일을 업로드하지 못했습니다. 관리자에게 문의하세요',
      });
    }
  };

  const onSelectImagePress = () => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
    return launchImageLibrary({mediaType: 'image'}, onMediaUpload);
  };

  // for Image Delete
  const onMediaDelete = async media => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
    try {
      // Delete Process
      const desertRef = storage().ref(media.path);
      await desertRef.delete();
      showSuccess({message: '파일을 삭제했습니다.'});
      fetchImages();
    } catch (e) {
      handleError({
        message: '파일을 삭제하지 못했습니다. 관리자에게 문의하세요',
      });
    }
  };

  const fetchImages = async () => {
    let i = 0;
    setImagesUrl([]);
    await stoageRef.list().then(result => {
      if (result.items.length > 0) {
        result.items.forEach(ref => {
          // console.log('ref: ', ref);
          storage()
            .ref(ref.fullPath)
            .getDownloadURL()
            .then(url => {
              setImagesUrl(imagesUri => [
                ...imagesUri,
                {id: i.toString(), url: url, path: ref.path},
              ]);
              i++;
            });
        });
      }
    });
    // return Promise.resolve();
  };

  const getBase64 = async () => {
    base64Arr = [];
    imagesUrl.forEach(image => {
      ReactNativeBlobUtil.fetch('GET', image.url).then(res => {
        let base64Str = res.base64();
        // var imageUrl = 'data:image/png;base64,' + base64Str;
        base64Arr.push('data:image/png;base64,' + base64Str);
        if (base64Arr.length === imagesUrl.length) {
          let shareImage = {
            title: item.value,
            message: item.feedback,
            urls: base64Arr,
          };
          Share.open(shareImage)
            .then((res) => {
              // console.log(res);
            })
            .catch((err) => {
              // err && console.log(err);
            });
        }
        // let text = res.text()
        // let json = res.json()
      });
    });
  };

  const onChecked = async () => {
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
    dispatch({type: CHANGE_CHECK_LIST});
    let selected = '식재관리';
    if (includes(item.checkName, 'hygiene')) {
      selected = '개인위생';
    } else if (includes(item.checkName, 'ingredient')) {
      selected = '식재관리';
    } else if (includes(item.checkName, 'kitchen')) {
      selected = '조리장위생';
    }

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
    if (role !== 'admin' || !role) { return handleError({message: '권한이 없습니다.'})}
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
      showSuccess({
        message: '피드백이 저장되었습니다.',
      });
    } catch (e) {
      handleError({
        message: '피드백이 저장되지 못했습니다. 관리자에게 문의하세요',
      });
      dispatch({type: CHANGE_CHECK_LIST_ERROR, payload: e});
      console.log('e', e);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [])

  const renderItem = img => {
    const topElement = (
      <Image
        source={{uri: img.url}}
        style={styles.image}
        resizeMode="stretch"
      />
    );
    // const bottomElement = <Text medium>{item.title}</Text>;
    return (
      <ChooseItem
        key={img.id}
        item={img}
        onPress={() => selectMethod(img.id)}
        onDelete={onMediaDelete}
        active={selectedM && img.id && img.id === selectedM}
        topElement={topElement}
        // bottomElement={bottomElement}
        containerStyle={styles.item}
      />
    );
  };

  return (
    <ThemedView isFullView>
      <Header
        leftComponent={<IconHeader />}
        centerComponent={<TextHeader title={'피드백 사항'} />}
        rightComponent={<ShareIcon onShare={getBase64} />}
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
                {imagesUrl[0]}
              </Text> */}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.scroll}>
              <TouchableOpacity onPress={onSelectImagePress}>
                <Image
                  source={require('src/assets/images/plus2.png')}
                  resizeMode="stretch"
                  style={[styles.image, {marginVertical: margin.base}]}
                />
              </TouchableOpacity>
              {uploading ? (
                <View style={styles.viewLoading}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.progress}>{`${(
                    (uploadTaskSnapshot.bytesTransferred /
                      uploadTaskSnapshot.totalBytes) *
                    100
                  ).toFixed(2)}% / 100%`}</Text>
                </View>
              ) : (
                imagesUrl.length > 0 && imagesUrl.map(img => renderItem(img))
              )}
            </ScrollView>
            <View style={styles.marginBottom('big')}>
              <Input
                label={'피드백'}
                multiline
                numberOfLines={8}
                value={feedback}
                onChangeText={value => setFeedback(value)}
              />
            </View>
            <Button
              loading={false}
              title={'피드백 저장'}
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
    width: 126,
    height: 126,
    marginRight: margin.large,
  },
  tab: {
    fontSize: 10,
    lineHeight: 15,
  },
  item: {
    marginRight: margin.large,
  },
  progress: {
    marginTop: 20,
    fontSize: 9,
  },
  viewLoading: {
    // marginVertical: margin.large,
    // marginLeft: '50%',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default FeedbackScreen;
