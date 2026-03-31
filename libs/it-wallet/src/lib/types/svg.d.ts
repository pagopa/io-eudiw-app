/**
 * Type definition for react-native-svg which allows to import SVG files as React components.
 */
declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
