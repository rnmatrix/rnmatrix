import React from 'react';
import NavigationContext from '../contexts/NavigationContext';

const withNavigation = (Component: any, navigationMapper?) => (navigationProps) => {
  const props = navigationMapper ? navigationMapper(navigationProps) : navigationProps;
  return (
    <NavigationContext.Provider value={props}>
      <Component {...props} />
    </NavigationContext.Provider>
  );
};

export default withNavigation;
