import React, {useState} from 'react';
import {View, ScrollView, Image, KeyboardAvoidingView} from 'react-native';
import {Header, Text, ThemedView} from 'src/components';
import {Row, Col} from 'src/containers/Gird';
import CheckBox from 'src/components/checkbox/CheckBox';
import Input from 'src/containers/input/Input';
import Button from 'src/containers/Button';
import Container from 'src/containers/Container';
import {TextHeader, IconHeader} from 'src/containers/HeaderComponent';

import {margin} from 'src/components/config/spacing';

const FeedbackScreen = props => {
  console.log('props', props.route);
  const {data} = props.route.params || '';
  // const {onChecked} = props.route.params || '';
  const [feedback, setFeedback] = useState('');

  // constructor(props) {
  //   super(props);
  //   const {
  //     auth: {isLogin, user},
  //     route,
  //   } = props;
  //   const product_id = route?.params?.product_id ?? '';
  //   this.state = {
  //     product_id,
  //     review: '',
  //     reviewer: isLogin ? user.display_name : '',
  //     reviewer_email: isLogin ? user.user_email : '',
  //     rating: 1,
  //     status: isLogin ? 'approved' : 'hold',
  //   };
  // }

  const addReview = () => {
    const {product_id} = this.state;
    if (product_id) {
      dispatch(addReview(this.state, () => navigation.goBack()));
    }
  };

  // render() {
  //   const {
  //     t,
  //     route,
  //     auth: {isLogin},
  //     dataReview,
  //   } = this.props;
  //   const {review, reviewer, reviewer_email, rating} = this.state;

  //   const imageProduct = route?.params?.image ?? '';
  //   const nameProduct = route?.params?.name ?? t('catalog:text_product_review');

  return (
    <ThemedView isFullView>
      <Header
        leftComponent={<IconHeader />}
        centerComponent={<TextHeader title={'피드백 사항'} />}
      />
      <KeyboardAvoidingView behavior="height" style={styles.keyboard}>
        <ScrollView>
          <Container>
            <View style={[styles.viewContent, styles.marginBottom('big')]}>
              <Image
                source={require('src/assets/images/pDefault.png')}
                resizeMode="stretch"
                style={[styles.image, styles.marginBottom('small')]}
              />
              <Row style={styles.row}>
                <Col style={styles.center}>
                  <Text medium>{data.value}</Text>
                </Col>
                {/* <CheckBox colorThird style={styles.textCreateAt} theme={theme} /> */}
                <CheckBox colorThird onPress={()=>{}} checked={data.checked} />
              </Row>
              {/* <Text medium style={styles.marginBottom('large')}>
                {item}
              </Text> */}
              <Text colorThird style={styles.tab}>
                star
              </Text>
              {/* <Rating
                size={20}
                startingValue={rating}
                onStartRating={value => this.setState({rating: value})}
              /> */}
            </View>
            <View style={styles.marginBottom('big')}>
              <Input
                label={'피드백을 여기에 작성해 주세요.'}
                multiline
                numberOfLines={8}
                value={feedback}
                onChangeText={value => this.setState({review: value})}
              />
            </View>
            <Button
              loading={false}
              title={'저장'}
              containerStyle={styles.marginBottom('big')}
              onPress={addReview}
            />
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = {
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
  },
  tab: {
    fontSize: 10,
    lineHeight: 15,
  },
};

// const mapStateToProps = state => {
//   return {
//     auth: authSelector(state),
//     dataReview: dataReviewSelector(state),
//   };
// };
export default FeedbackScreen;
