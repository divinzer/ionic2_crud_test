import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import truncate from 'lodash/truncate';
import {Switch} from 'react-native';
import unescape from 'lodash/unescape';
import {StyleSheet, FlatList, View} from 'react-native';

import {Header, ListItem, ThemedView, Avatar} from 'src/components';
import {TextHeader, CartIcon, IconHeader} from 'src/containers/HeaderComponent';
import Container from 'src/containers/Container';

import {mainStack} from 'src/config/navigator';

import {margin, padding, borderRadius} from 'src/components/config/spacing';

const CheckListScreen = props => {
  const navigation = useNavigation();
  const {route} = props;
  const [data, setData] = useState([]);
  const [personal, setPeosonal] = useState([]);
  const [planting, setPlanting] = useState([]);
  const [cheif, setCheif] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log('aaa', route.params);
  const data2 = [{value: 'test'}, {value: 'test2'}]

  const fetchData = async () => {
    try {
      setLoading(true);
      let arr = [];
      const ref = firestore().collection('checklist').doc('checkItems');
        // .where('isDeleted', '==', false);
        await ref.onSnapshot(documentSnapshot => {
        console.log('User data: ', documentSnapshot.data());
        let id = 0;
        for (const hygiene in documentSnapshot.data()['개인위생']) {
          let value = documentSnapshot.data()['개인위생'][hygiene];
          arr.push({
            id: id,
            checkName: hygiene,
            value: value,
            check: false,
          });
          id++;
          console.log('arr', arr);
        }
        // documentSnapshot.data()['개인위생'].forEach(doc => {
        //   console.log('doc', doc);
        // })
        setPeosonal(arr);
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const itemNotification = ({item}) => {

    const description = truncate(item.description, {
      length: 26,
      omission: '',
    });
    const subtitle = `${item.isCreated}\n${description}`;

    return (
      <Container>
        <ListItem
          title={item.value}
          style={styles.item}
          containerStyle={styles.containerItem}
          titleStyle={styles.titleItem}
          titleProps={{
            h4: true,
            medium: true,
          }}
          // leftAvatar={avatarLeft(item.type)}
          // rightIcon={
            // <Dot color={item.isRead ? green : grey3} style={styles.dot} />
          // }
          pad={20}
          onPress={() => navigation.navigate(mainStack.notification_detail)}
        />
      </Container>
    );
  };

  return (
    <ThemedView isFullView>
      <Header
        leftComponent={<IconHeader />}
        centerComponent={<TextHeader title={route.params.weekName} />}
        // centerComponent={<TextHeader title={route.params.weekName} />}
        rightComponent={<CartIcon />}
      />
      <FlatList
          data={personal}
          keyExtractor={item => `${item.id.toString()}`}
          renderItem={itemNotification}
          ListFooterComponentStyle={<View style={styles.footer} />}
        />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom: margin.big,
  },
  item: {
    borderWidth: 1,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    paddingHorizontal: padding.big,
    marginRight: margin.small,
  },
  itemFirst: {
    marginLeft: margin.large,
  },
  itemLast: {
    marginRight: margin.large,
  },
  textName: {
    lineHeight: 17,
  },
});

export default CheckListScreen;
