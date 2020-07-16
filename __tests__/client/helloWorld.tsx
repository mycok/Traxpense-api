/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';

import HelloWorld from '../../client/src/HelloWord';

describe('<HelloWorld', () => {
  it("should render 'Hello World' text", async () => {
    const { findByTestId } = render(<HelloWorld />);
    const paragraphElement = await findByTestId('hello-world');

    expect(paragraphElement).toHaveTextContent(/^Hello World!!!$/);
  });
});
