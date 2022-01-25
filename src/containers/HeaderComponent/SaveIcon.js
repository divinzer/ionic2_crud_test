// @flow
import React from 'react';
import auth from '@react-native-firebase/auth';
import {StyleSheet, TouchableOpacity, Animated} from 'react-native';

// import {connect} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {ScreenProps} from 'react-native-screens';
import {Badge, Icon} from 'src/components';
import NavigationServices from 'src/utils/navigation';
import {rootSwitch, authStack} from 'src/config/navigator';

// import {countItemSelector} from 'src/modules/cart/selectors';
// import {configsSelector} from 'src/modules/common/selectors';
import {white, black, orange, grey4} from 'src/components/config/colors';

type Props = {
  value: number,
  isAnimated: boolean,
  navigation: ScreenProps,
};

class SaveIcon extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      scale: new Animated.Value(1),
    };
  }

  UNSAFE_componentWillMount() {
    if (this.props.isAnimated) {
      this.animated();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.count < this.props.count) {
      this.animated();
    }
  }

  signOut = async () => {
    try {
      await auth().signOut();
      NavigationServices.navigate(rootSwitch.auth, {screen: authStack.login});
    } catch (e) {
      NavigationServices.navigate(rootSwitch.auth, {screen: authStack.login});
    }
  };
  animated = () => {
    const {scale} = this.state;
    const toValue = scale._value === 1 ? 1.5 : 1;
    Animated.timing(scale, {
      toValue: toValue,
      useNativeDriver: false,
    }).start(() => {
      if (toValue === 1.5) {
        this.animated();
      }
    });
  };

  render() {
    const {iconProps, navigation} = this.props;
    return (
      <TouchableOpacity onPress={this.signOut} style={styles.container}>
        <Animated.View
          style={[
            styles.view,
            {
              transform: [{scale: this.state.scale}],
            },
          ]}>
          {/* <Badge
            status="error"
            badgeStyle={badgeStyle}
            textStyle={textStyle}
            value={count}
          /> */}
        </Animated.View>
        <Icon color={black} type="font-awesome" name={'save'} size={20} underlayColor={'transparent'} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  view: {
    zIndex: 9999,
  },
});
SaveIcon.defaultProps = {
  count: 0,
  isAnimated: false,
  iconProps: {},
};

// const mapStateToProps = state => ({
//   count: countItemSelector(state),
//   configs: configsSelector(state),
// });

const SaveIconComponent = SaveIcon;

export default function (props) {
  const navigation = useNavigation();
  return <SaveIconComponent {...props} navigation={navigation} />;
}
