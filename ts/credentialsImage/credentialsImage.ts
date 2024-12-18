import {ImageSourcePropType} from 'react-native/types';

type CredentialAsset = {
  asset: ImageSourcePropType;
  textColor: string;
};

const credentialsImage: Record<string, CredentialAsset> = {
  PersonIdentificationData: {
    asset: require('../../assets/credentials/pid.png'),
    textColor: '#000'
  }
};

export default credentialsImage;
