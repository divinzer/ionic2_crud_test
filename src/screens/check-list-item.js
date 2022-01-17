import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {withTheme, Avatar, Text} from 'src/components';
import {Row, Col} from 'src/containers/Gird';
import Container from 'src/containers/Container';
import CheckBox from 'src/components/checkbox/CheckBox';

import {margin, padding} from 'src/components/config/spacing';

const CheckListItem = ({data, theme, onChecked}) => {
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
      <Row style={styles.row}>
        <Col style={styles.center}>
          <Text medium>{data.value}</Text>
        </Col>
        {/* <CheckBox colorThird style={styles.textCreateAt} theme={theme} /> */}
        <CheckBox colorThird onPress={onChecked} checked={data.checked} />
      </Row>
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
