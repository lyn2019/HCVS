// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import ordinaryFlag from "./ordinaryFlagType";
type RosterContentmenuType = {
 id:string,
 type:string;//menu类型，根据类型对应相应的操作,camera 控制摄像头 mike 控制麦克风  roster 在线用户管理 line 离线管理
 name:string;//显示menu名称
 value:ordinaryFlag;//0 ,1
 icon?:string//图标
};

export default RosterContentmenuType;
