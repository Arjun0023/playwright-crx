/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { crx, expect, _debug } from 'playwright-crx/test';

const _crxAppPromise = crx.start();

async function _runTest(fn: (params: any) => Promise<void>, params: any) {
  const [crxApp, [ tab ]] = await Promise.all([_crxAppPromise, chrome.tabs.query({ active: true })]);
  const server = { PREFIX: `chrome-extension://${chrome.runtime.id}`, EMPTY_PAGE: `chrome-extension://${chrome.runtime.id}/empty.html` };
  const context = crxApp.context();
  await context.route(server.EMPTY_PAGE, (route) => route.fulfill({ body: '', contentType: 'text/html' }));
  expect(tab?.id).toBeTruthy();
  const page = await crxApp.attach(tab?.id!);
  await fn({ expect, page, context, crxApp, server, _debug, ...params });
}

Object.assign(self, { _runTest });
