import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { test, expect, describe } from '@jest/globals';
import nock from 'nock';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const getContent = (filepath) => fs.readFileSync(getFixturePath(filepath), 'utf-8');
const rss1 = getContent('rss1.xml');
const rssUrl1 = 'http://lorem-rss.herokuapp.com/feed';
const proxy = 'https://hexlet-allorigins.herokuapp.com';
const proxyApi = '/get';
const pathToHtml = path.join(__dirname, '../template.html');
const html = fs.readFileSync(pathToHtml, 'utf8');
beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});
beforeEach(async () => {
  document.body.innerHTML = html;
  await app();
});

test('add rss url', async () => {
  const scope = nock(proxy)
    .get(proxyApi)
    .query({ url: rssUrl1, disableCache: true })
    .reply(200, { contents: rss1 });
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl1);
  userEvent.click(screen.getByRole('button', { name: 'add' }));

  expect(await screen.findByText(/RSS успешно загружен/i)).toBeInTheDocument();
  scope.done();
});
