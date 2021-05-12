import '@testing-library/jest-dom';
import testingLibraryDom from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import { test, expect, describe } from '@jest/globals';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';

const { screen, waitFor } = testingLibraryDom;
const userEvent = testingLibraryUserEvent.default;

beforeEach(() => {
  const initHTML = fs.readFileSync(path.join('__fixtures__', 'index.html')).toString();
  document.body.innerHTML = initHTML;
  app();
});

test('first DOM test', async () => {
  const rss1 = 'http://lorem-rss.herokuapp.com/feed';
  userEvent.type(screen.getByLabelText('url'), rss1);
  expect(screen.getByLabelText('url')).toHaveDisplayValue(rss1);
  userEvent.click(screen.getByLabelText(/add/));
  await waitFor(() => {
    expect(screen.getByLabelText('url')).toHaveDisplayValue('');
  });
});
