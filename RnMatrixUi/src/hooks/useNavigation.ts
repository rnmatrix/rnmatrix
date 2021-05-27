import { useContext } from 'react';
import NavigationContext from '../contexts/NavigationContext';

/**
 * TODO: A custom useNavigation to support all navigations
 * */
function useNavigation(): any {
  const { navigation, route } = useContext(NavigationContext);
  return navigation;
}

export default useNavigation;
