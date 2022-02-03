import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {StyleSheet, KeyboardAvoidingView, View} from 'react-native';
import {Header, ThemedView, Button, Text, ThemeConsumer, Modal} from 'src/components';
import Container from 'src/containers/Container';
import Input from 'src/containers/input/Input';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';
import NavigationServices from 'src/utils/navigation';
import {rootSwitch, mainStack} from 'src/config/navigator';
import {showSuccess} from 'src/utils/error';
import {margin} from 'src/components/config/spacing';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
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
    // dispatch(signInWithEmail({username, password}));
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(username, password);
      setLoading(false);
      navigation.navigate(rootSwitch.main);
    } catch (e) {
      // setError(e);
      setError({message: '이메일 또는 비밀번호가 맞지 않습니다.'});
      setLoading(false);
    }
  };

  const checkLogin = async () => {
    const currentUser = await auth().currentUser;
    if (currentUser) {
      // navigation.navigate(rootSwitch.main);
      NavigationServices.navigate(rootSwitch.main, {
        screen: mainStack.wish_list,
      });
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
    checkLogin();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <ThemeConsumer>
      {({theme}) => (
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
      )}
    </ThemeConsumer>
  );
};

const styles = StyleSheet.create({
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
  divOr: {
    flex: 1,
  },
  textOr: {
    marginHorizontal: margin.base,
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
