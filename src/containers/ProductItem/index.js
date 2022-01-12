// @flow
import React from 'react';
import ItemDefault from './ItemDefault';
import ItemSecondary from './ItemSecondary';
import ItemWishlist from './ItemWishlist';
import ItemCart from './ItemCart';
import ItemOrder from './ItemOrder';

type Props = {
  type: 'default' | 'secondary' | 'wishlist' | 'cart' | 'order',
};
const ProductItem = (props: Props) => {
  const {type, item, ...rest} = props;
  console.log('item', item);
  if (!item || !item.id) {
    return null;
  }
  if (type === 'secondary') {
    return <ItemSecondary item={item} {...rest} />;
  } else if (type === 'wishlist') {
    return <ItemWishlist item={item} {...rest} />;
  } else if (type === 'cart') {
    return <ItemCart item={item} {...rest} />;
  } else if (type === 'order') {
    return <ItemOrder item={item} {...rest} />;
  }
  return <ItemDefault item={item} {...rest} />;
};

ProductItem.defaultProps = {
  type: 'default',
};

export default ProductItem;
