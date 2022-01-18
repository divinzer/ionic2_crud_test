import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {withTheme, Text} from 'src/components';
import {Row, Col} from 'src/containers/Gird';
import Container from 'src/containers/Container';
import CheckBox from 'src/components/checkbox/CheckBox';

import {margin, padding} from 'src/components/config/spacing';
import {mainStack} from 'src/config/navigator';

const CheckListItem = ({data, theme, onChecked}) => {
  const navigation = useNavigation();
  const goFeedback = () =>
    navigation.navigate(mainStack.feedback, {
      data,
    });

  if (!data) {
    return null;
  }
  return (
    <Container
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
        },
      ]}>
      <TouchableOpacity onPress={goFeedback}>
        <Row style={styles.row}>
          <Col style={styles.center}>
            <Text medium>{data.value}</Text>
          </Col>
          {/* <CheckBox colorThird style={styles.textCreateAt} theme={theme} /> */}
          <CheckBox colorThird onPress={onChecked} checked={data.checked} />
        </Row>
      </TouchableOpacity>
    </Container>
  );
};

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

export default withTheme(CheckListItem);
