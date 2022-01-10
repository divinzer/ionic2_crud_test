import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet, ScrollView, KeyboardAvoidingView} from 'react-native';
import {
  Header,
  ThemedView,
  Button,
  ThemeConsumer,
} from 'src/components';
import Container from 'src/containers/Container';
import Input from 'src/containers/input/Input';
import TextHtml from 'src/containers/TextHtml';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';

import {rootSwitch} from 'src/config/navigator';

import {signInWithEmail} from 'src/modules/auth/actions';
import {authSelector} from 'src/modules/auth/selectors';
import {requiredLoginSelector} from 'src/modules/common/selectors';
import {margin} from 'src/components/config/spacing';

import {changeColor} from 'src/utils/text-html';

const mapStateToProps = state => {
  return {
    auth: authSelector(state),
    requiredLogin: requiredLoginSelector(state),
  };
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {auth, requiredLogin} = useSelector(mapStateToProps);
  const {pending, loginError} = auth;
  const {message, errors} = loginError;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    dispatch(signInWithEmail({username, password}));
  };

  return (
    <ThemeConsumer>
      {({theme}) => (
        <ThemedView isFullView>
          <Header
            leftComponent={
              !requiredLogin && (
                <IconHeader
                  name="x"
                  size={24}
                  onPress={() => navigation.navigate(rootSwitch.main)}
                />
              )
            }
            centerComponent={<TextHeader title={'LogIn'} />}
          />
          <KeyboardAvoidingView behavior="height" style={styles.keyboard}>
            <ScrollView>
              <Container>
                {message ? (
                  <TextHtml
                    value={message}
                    style={changeColor(theme.colors.error)}
                  />
                ) : null}
                <Input
                  label={'email_address'}
                  value={username}
                  onChangeText={value => setUsername(value)}
                  error={errors && errors.username}
                  keyboardType="email-address"
                />
                <Input
                  label={'password'}
                  value={password}
                  secureTextEntry
                  onChangeText={value => setPassword(value)}
                  error={errors && errors.password}
                />
                <Button
                  title={'Login'}
                  loading={pending}
                  onPress={handleLogin}
                  containerStyle={styles.margin}
                />
              </Container>
            </ScrollView>
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
