import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { test, expect } from '@jest/globals';
import nock from 'nock';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';

// https://github.com/axios/axios/issues/305

axios.defaults.adapter = require('axios/lib/adapters/http');

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const getContent = (filepath) => fs.readFileSync(getFixturePath(filepath), 'utf-8');
const rss1 = getContent('rss1.xml');
const rssUrl1 = 'http://lorem-rss.herokuapp.com/feed';
const proxy = 'https://hexlet-allorigins.herokuapp.com';
const proxyApi = '/get';
const pathToHtml = path.join(__dirname, '../template.html');
const html = fs.readFileSync(pathToHtml, 'utf8');
// beforeAll(() => {
nock.disableNetConnect();
// });

beforeEach(async () => {
  document.body.innerHTML = html;
  await app();
});

test('add rss url', async () => {
  nock(proxy)
    .get(proxyApi)
    .query({ url: rssUrl1 })
    .reply(200, { contents: rss1 });
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl1);
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  expect(await screen.findByText(/RSS успешно загружен/i)).toBeInTheDocument();
});
test('validation: add not url', async () => {
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), 'not url');
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  expect(await screen.findByText(/Ссылка должна быть валидным URL/i)).toBeInTheDocument();
});
test('validation: add rss repeatedly', async () => {
  nock(proxy)
    .get(proxyApi)
    .query({ url: rssUrl1 })
    .reply(200, { contents: rss1 });
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl1);
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl1);
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  expect(await screen.findByText(/RSS уже существует/i)).toBeInTheDocument();
});
test('validation: invalid rss link', async () => {
  nock(proxy)
    .get(proxyApi)
    .query({ url: 'https://hh.ru/rss' })
    .reply(200, { contents: 'invalid rss' });
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), 'https://hh.ru/rss');
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  expect(await screen.findByText(/Ресурс не содержит валидный RSS/i)).toBeInTheDocument();
});
test('network error', async () => {
  nock(proxy)
    .get(proxyApi)
    .query({ url: rssUrl1 })
    .reply(500);
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl1);
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  expect(await screen.findByText(/Ресурс не содержит валидный RSS/i)).toBeInTheDocument();
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});
