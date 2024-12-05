/**
 * Using require is needed to typescript complaining about errors in the package.
 * See https://github.com/infinitered/reactotron/issues/1430 for more information.
 */
const Reactotron = require('reactotron-react-native').default;
const {reactotronRedux} = require('reactotron-redux');

const reactotron = Reactotron.configure({})
  .useReactNative() // add all built-in react native plugins
  .use(reactotronRedux()) // add redux plugin
  .connect(); // let's connect!

export default reactotron;
