// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode,useReducer} from 'react';
import getLanguageStatusContext, {initLanguage,Languagetype,SetLanguageActon} from '../context/getLanguageContext';


const reducer = (state: Languagetype, action: SetLanguageActon): Languagetype => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        lang: action.lang
      };
    default:
      throw new Error();
  }
};
type Props = {
  children: ReactNode;
};


export default function(props: Props) {
  const { children } = props;
  const getLanguageContext = getLanguageStatusContext();
  return (
    <getLanguageContext.Provider value={useReducer(reducer, initLanguage)}>
      {children}
    </getLanguageContext.Provider>
  );
}
