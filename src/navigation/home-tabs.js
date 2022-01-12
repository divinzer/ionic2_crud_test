import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// import HomeDrawer from './home-drawer';
import Me from 'src/screens/profile/me';
import Cart from 'src/screens/cart/cart';
import Category from 'src/screens/shop/category';
import Wishlist from 'src/screens/wishlist';
import Tabbar from 'src/containers/Tabbar';

import {homeTabs} from 'src/config/navigator';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator tabBar={props => <Tabbar {...props} />}>
      {/* <Tab.Screen
        name={homeTabs.home_drawer}
        component={HomeDrawer}
        options={{headerShown: false}}
      /> */}
      <Tab.Screen
        name={homeTabs.wish_list}
        component={Wishlist}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name={homeTabs.shop}
        component={Category}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name={homeTabs.cart}
        component={Cart}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name={homeTabs.me}
        component={Me}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
}
