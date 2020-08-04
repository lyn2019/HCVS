// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
// const [lang] = useState('en');

import en from '../i18n/en-US';
import jp from '../i18n/ja-JP';
import cn from '../i18n/zh_CN';

const DEFAULT_LOCALE = 'cn';

const messages = {
  en,
  jp,
  cn
};

type Props = {
  children: ReactNode;
};

export default function I18nProvider(props: Props) {
  const { children } = props;
  return (
    <IntlProvider
      locale={
        (navigator.languages && navigator.languages[0]) || navigator.language
      }
      defaultLocale={DEFAULT_LOCALE}
      messages={messages[DEFAULT_LOCALE]}
    >
      {children}
    </IntlProvider>
  );
}
