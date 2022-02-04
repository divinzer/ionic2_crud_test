import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {createStructuredSelector} from 'reselect';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet, KeyboardAvoidingView, View} from 'react-native';
import {Header, ThemedView, Button, Text, Modal} from 'src/components';
import Container from 'src/containers/Container';
import Input from 'src/containers/input/Input';
import {TextHeader} from 'src/containers/HeaderComponent';
import {rootSwitch} from 'src/config/navigator';
import {showSuccess} from 'src/utils/error';
import {margin} from 'src/components/config/spacing';

import {
  SIGN_IN_WITH_FIREBASE,
  SIGN_IN_WITH_FIREBASE_SUCCESS,
  SIGN_IN_WITH_FIREBASE_ERROR,
  FETCH_AUTH,
  FETCH_AUTH_SUCCESS,
  FETCH_AUTH_ERROR,
} from 'src/modules/firebase/constants';

import {loadingListSelector} from 'src/modules/firebase/selectors';

const stateSelector = createStructuredSelector({
  loading: loadingListSelector(),
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {loading} = useSelector(stateSelector);
  const [initializing, setInitializing] = useState(true);
  const [errors, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isModal, setModal] = useState(false);

  // Handle user state changes
  function onAuthStateChanged() {
    if (initializing) setInitializing(false);
  }

  const handleLogin = async () => {
    dispatch({type: SIGN_IN_WITH_FIREBASE});
    try {
      const logined = await auth().signInWithEmailAndPassword(
        username,
        password,
      );
      // console.log('logined', logined.user._user);
      dispatch({type: SIGN_IN_WITH_FIREBASE_SUCCESS, payload: logined.user});
      await checkAuth();
      // navigation.navigate(rootSwitch.wish_list);
    } catch (e) {
      dispatch({type: SIGN_IN_WITH_FIREBASE_ERROR, payload: e});
      setError({message: '이메일 또는 비밀번호가 맞지 않습니다.'});
    }
  };

  const checkAuth = async () => {
    dispatch({type: FETCH_AUTH});
    try {
      const currentUser = await auth().currentUser;
      // console.log('currentUser1: ', currentUser._user.uid);
      const role = await firestore()
        .collection('users')
        .doc(currentUser._user.uid)
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot.exists) {
            // console.log('onSnapshot: ', documentSnapshot.data());
            return documentSnapshot.data();
          } else {
            return {
              role: '',
            };
          }
        });
      dispatch({type: FETCH_AUTH_SUCCESS, payload: role});
      // }
    } catch (e) {
      dispatch({type: FETCH_AUTH_ERROR, payload: e});
    }
  };

  const sendEmail = async () => {
    try {
      await auth().sendPasswordResetEmail(email);
      showSuccess({message: '메일이 발송되었습니다.'});
      setModal(false);
    } catch (e) {
      showSuccess({message: e});
      // console.log('e', e);
    }
  };

  useEffect(() => {
    // checkLogin();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <ThemedView isFullView>
      <Header
        // leftComponent={
        //   <IconHeader
        //     name="x"
        //     size={24}
        //     onPress={() => navigation.navigate(rootSwitch.main)}
        //   />
        // }
        centerComponent={<TextHeader title={'플래이팅 - 위생점검'} />}
      />
      <KeyboardAvoidingView behavior="height" style={styles.keyboard}>
        <Container>
          <Input
            label={'email_address'}
            value={username}
            onChangeText={value => setUsername(value)}
            // error={errors && errors.message}
            keyboardType="email-address"
          />
          <Input
            label={'password'}
            value={password}
            secureTextEntry
            onChangeText={value => setPassword(value)}
            error={errors && errors.message}
          />
          <Button
            title={'로그인'}
            disabled={!username || !password}
            loading={loading}
            onPress={handleLogin}
            containerStyle={styles.margin}
          />
          <Text
            onPress={() => {
              setModal(!isModal);
            }}
            style={styles.textForgot}
            medium>
            비밀번호 찾기
          </Text>
        </Container>
        <Modal
          visible={isModal}
          transparent
          setModalVisible={value => setModal(value)}
          ratioHeight={0.3}
          title={'비밀번호 변경'}>
          <Container>
            <View style={styles.marginBottom('small')}>
              <Input
                label={'hello@plating.co.kr'}
                multiline
                numberOfLines={1}
                value={email}
                onChangeText={value => setEmail(value)}
              />
            </View>
            <Button
              loading={false}
              title={'요청'}
              containerStyle={styles.marginBottom('big')}
              onPress={() => sendEmail(email)}
            />
          </Container>
        </Modal>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  textForgot: {
    textAlign: 'center',
  },
  viewOr: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textAccount: {
    textAlign: 'center',
    marginBottom: margin.base,
  },
  margin: {
    marginVertical: margin.big,
  },
  viewSocial: {
    marginBottom: margin.big,
  },
  marginBottom: type => ({
    marginBottom: margin[type],
  }),
});

LoginScreen.navigationOptions = screenProps => ({
  headerShown: false,
});

export default LoginScreen;
