import {StatusBarStyle} from 'react-native';
import {Alert as AlertDs} from '@pagopa/io-app-design-system';
import React from 'react';
import i18next from 'i18next';
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
    case wellKnownCredential.HEALTHID:
      return {
        backgroundColor: '#295699',
        textColor: '#652035',
        statusBarStyle: 'light-content'
      };
    case wellKnownCredential.FBK_BADGE:
      return {
        backgroundColor: '#744C63',
        textColor: '#152A45',
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

export const getCredentialAlertPropsByCredentialType = (
  credentialType: string
): React.ComponentProps<typeof AlertDs> | undefined => {
  switch (credentialType) {
    case wellKnownCredential.FBK_BADGE:
      return {
        variant: 'info',
        content: i18next.t('wallet:credentials.details.fbk')
      };
    default:
      return undefined;
  }
};
