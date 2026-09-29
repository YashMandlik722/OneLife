import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';
import App from './App';

// Disable native screens to prevent IllegalViewOperationException on dev builds without native RNSScreen ViewManager
enableScreens(false);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
