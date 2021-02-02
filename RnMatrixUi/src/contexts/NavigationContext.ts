import { createContext } from 'react';

type NavigationProp = {
  navigation: any;
  route: any;
};
// FIXME
// @ts-ignore
const NavigationContext = createContext<NavigationProp>(undefined);
NavigationContext.displayName = 'NavigationContext';
export default NavigationContext;
