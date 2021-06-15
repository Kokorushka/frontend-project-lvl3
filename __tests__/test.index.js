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
const rss2 = getContent('rss2.xml');
const rssUrl1 = 'https://nplus1.ru/rss';
const rssUrl2 = 'https://arzamas.academy/feed_v1.rss';
const proxy = 'https://hexlet-allorigins.herokuapp.com';
const proxyApi = '/get';
// const addProxy = (url) => {
//   const urlWithProxy = new URL(proxy);
//   urlWithProxy.searchParams.set('url', url);
//   urlWithProxy.searchParams.set('disableCache', 'true');
//   return urlWithProxy.toString();
// };
// console.log(addProxy(rssUrl1));
beforeAll(() => {
  nock.disableNetConnect();
});

beforeEach(async () => {
  const pathToHtml = path.join(__dirname, '../index.html');
  const html = fs.readFileSync(pathToHtml, 'utf8');
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
  expect(await screen.findByText(/Ошибка сети/i)).toBeInTheDocument();
});
test('rss feeds and posts added', async () => {
  nock(proxy)
    .get(proxyApi)
    .query({ url: rssUrl1 })
    .reply(200, { contents: rss1 });
  nock(proxy)
    .get(proxyApi)
    .query({ url: rssUrl2 })
    .reply(200, { contents: rss2 });
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl1);
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl2);
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  expect(await screen.findByText(/Нарциссизм оказался значительным фактором риска агрессивного и насильственного поведения/i)).toBeInTheDocument();
  expect(await screen.findByText(/Сбер разработал беспилотный автомобиль без руля и педалей/i)).toBeInTheDocument();
  expect(await screen.findByText(/Google начала использовать операционную систему Fuchsia в серийных устройствах/i)).toBeInTheDocument();
  expect(await screen.findByText(/13 вопросов об инквизиции/i)).toBeInTheDocument();
  expect(await screen.findByText(/Хаяо Миядзаки: как начать смотреть его фильмы/i)).toBeInTheDocument();
  expect(await screen.findByText(/15 самых популярных легенд об Иване Грозном/i)).toBeInTheDocument();
});
test('modals are working', async () => {
  nock(proxy)
    .get(proxyApi)
    .query({ url: rssUrl1 })
    .reply(200, { contents: rss1 });
  userEvent.type(screen.getByRole('textbox', { name: 'url' }), rssUrl1);
  userEvent.click(screen.getByRole('button', { name: 'add' }));
  const btns = await screen.findAllByTestId('preview');
  const postLinks = await screen.findAllByTestId('post-link');
  expect(postLinks[0]).toHaveClass('font-weight-bold');
  userEvent.click(btns[0]);
  const updatedPostLinks = await screen.findAllByTestId('post-link');
  expect(updatedPostLinks[0]).not.toHaveClass('font-weight-bold');
  expect(updatedPostLinks[1]).toHaveClass('font-weight-bold');
  expect(await screen.findByText('Метаанализ показал, что нарциссическое расстройства является фактором агрессивного поведения')).toBeVisible();
});
afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});
