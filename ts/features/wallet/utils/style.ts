import {StatusBarStyle} from 'react-native';
import {HeaderSecondLevelHookProps} from '../../../hooks/useHeaderSecondLevel';
import {getCredentialNameByType, wellKnownCredential} from './credentials';

export type CredentialTheme = {
  backgroundColor: string;
  textColor: string;
  statusBarStyle: StatusBarStyle;
};

export const getThemeColorByCredentialType = (
  credentialType: string
): CredentialTheme => {
  switch (credentialType) {
    case wellKnownCredential.DRIVING_LICENSE:
      return {
        backgroundColor: '#744C63',
        textColor: '#652035',
        statusBarStyle: 'light-content'
      };
    case wellKnownCredential.PID:
    default:
      return {
        backgroundColor: '#295699',
        textColor: '#032D5C',
        statusBarStyle: 'light-content'
      };
  }
};

export const getHeaderPropsByCredentialType = (
  credentialType: string
): HeaderSecondLevelHookProps => {
  const {backgroundColor} = getThemeColorByCredentialType(credentialType);

  switch (credentialType) {
    // No custom header props at the moment
    default:
      return {
        title: getCredentialNameByType(credentialType),
        variant: 'contrast',
        backgroundColor
      };
  }
};
