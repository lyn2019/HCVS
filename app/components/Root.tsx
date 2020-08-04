// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {hot} from 'react-hot-loader/root';
import {HashRouter} from 'react-router-dom';


import ChimeProvider from '../providers/ChimeProvider';
import I18nProvider from '../providers/I18nProvider';
import UIStateProvider from '../providers/UIStateProvider';
import LanguageProvider from '../providers/LanguageProvider'

import Routes from '../Routes';

const Root = () => (
    <HashRouter>
        <LanguageProvider>
            <I18nProvider>
                <ChimeProvider>
                    <UIStateProvider>
                        <Routes/>
                    </UIStateProvider>
                </ChimeProvider>
            </I18nProvider>
        </LanguageProvider>
    </HashRouter>
);

export default hot(Root);
