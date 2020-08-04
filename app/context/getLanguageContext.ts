// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {Dispatch} from 'react';
import Language from '../enums/Language';


export interface Languagetype{
    lang:Language | null;
}
export  interface  SetLanguageActon  {
  lang: any;
  type:string
}


export const initLanguage: Languagetype = {
    lang:Language.en
};


const context = React.createContext<[Languagetype,Dispatch<SetLanguageActon>]>([
    initLanguage,
    (): void => {}
]);
export default function getLanguageContext() {
  return context;
}
