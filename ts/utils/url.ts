import {Linking} from 'react-native';

export const isHttp = (url: string): boolean => {
  const urlLower = url.trim().toLocaleLowerCase();
  return urlLower.match(/http(s)?:\/\//gm) !== null;
};

const canOpenUrl = async (url: string) => {
  if (!isHttp(url)) {
    return false;
  }
  return await Linking.canOpenURL(url);
};

const openWebUrl = (url: string, onError: () => void) => {
  canOpenUrl(url)
    .then(canOpen => {
      if (canOpen) {
        return Linking.openURL(url);
      } else {
        throw new Error('Cannot open URL');
      }
    })
    .then(() => {
      // Do nothing on success
    })
    .catch(_ => {
      onError();
    });
};

export {openWebUrl};
