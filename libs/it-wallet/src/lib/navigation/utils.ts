import { createSafeNavigator } from '@io-eudiw-app/navigation';
import { MainNavigatorParamsList } from './main/MainStackNavigator';

export const navigator = createSafeNavigator<MainNavigatorParamsList>();
