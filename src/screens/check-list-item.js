import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation, View} from '@react-navigation/native';
import {ThemeConsumer, Text} from 'src/components';
import {Row, Col} from 'src/containers/Gird';
import Container from 'src/containers/Container';
import CheckBox from 'src/components/checkbox/CheckBox';

import {margin, padding} from 'src/components/config/spacing';
import {red, black, grey4} from 'src/components/config/colors';
import {mainStack} from 'src/config/navigator';

const CheckListItem = React.memo(props => {
  const navigation = useNavigation();
  const {item, onChecked, fId} = props;
  const goFeedback = () =>
    navigation.navigate(mainStack.feedback, {
      item,
      fId,
    });

  // if (!item) {
  //   return null;
  // }
  
  return (
    <ThemeConsumer>
      {({theme}) => (
        <Container
          style={[
            styles.container,
            {
              backgroundColor: theme.ProductItem2.backgroundColor,
              borderColor: theme.colors.border,
            },
          ]}>
          <TouchableOpacity onPress={goFeedback}>
            <Row style={styles.row}>
              <Col style={styles.center}>
                <Text style={item.checked ? {color: red} : {color: black}} medium>
                  {item.value}
                </Text>
              </Col>
              {/* <CheckBox colorThird style={styles.textCreateAt} theme={theme} /> */}
              <CheckBox colorThird onPress={onChecked} checked={item.checked} />
            </Row>
          </TouchableOpacity>
        </Container>
      )}
    </ThemeConsumer>
    // </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // paddingVertical: padding.large,
    borderBottomWidth: 1,
  },
  textCreateAt: {
    fontSize: 9,
    lineHeight: 12,
  },
  row: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: margin.small,
    marginBottom: margin.small,
  },
  center: {
    // paddingLeft: padding.small,
    // paddingRight: padding.small,
  },
});

export default CheckListItem;
