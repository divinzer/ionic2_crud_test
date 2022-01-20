import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {StyleSheet, KeyboardAvoidingView} from 'react-native';
import {Header, ThemedView, Button, ThemeConsumer} from 'src/components';
import Container from 'src/containers/Container';
import Input from 'src/containers/input/Input';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';
import NavigationServices from 'src/utils/navigation';
import {rootSwitch, mainStack} from 'src/config/navigator';

import {margin} from 'src/components/config/spacing';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [errors, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // dispatch(signInWithEmail({username, password}));
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(username, password);
      setLoading(false);
      navigation.navigate(rootSwitch.main);
    } catch (e) {
      setError(e);
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

  useEffect(() => {
    checkLogin();
  }, []);

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
            centerComponent={<TextHeader title={'LogIn'} />}
          />
          <KeyboardAvoidingView behavior="height" style={styles.keyboard}>
            <Container>
              <Input
                label={'email_address'}
                value={username}
                onChangeText={value => setUsername(value)}
                error={errors && errors.message}
                keyboardType="email-address"
              />
              <Input
                label={'password'}
                value={password}
                secureTextEntry
                onChangeText={value => setPassword(value)}
                error={errors && errors.code}
              />
              <Button
                title={'Login'}
                disabled={!username || !password}
                loading={loading}
                onPress={handleLogin}
                containerStyle={styles.margin}
              />
            </Container>
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
});

LoginScreen.navigationOptions = screenProps => ({
  headerShown: false,
});

export default LoginScreen;
