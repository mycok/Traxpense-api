import React from 'react';
import { hot } from 'react-hot-loader';

function HelloWorld() {
  return <p data-testid="hello-world">Hello World!!!</p>;
}

export default hot(module)(HelloWorld);
