// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import {ipcRenderer, remote} from 'electron';
import React, {useCallback, useContext, useEffect, useState} from 'react';
// import {FormattedMessage, useIntl} from 'react-intl';
import {useIntl} from 'react-intl';
import Modal from 'react-modal';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getMeetingStatusContext from '../context/getMeetingStatusContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import MeetingStatus from '../enums/MeetingStatus';
import ViewMode from '../enums/ViewMode';
import Chat from './Chat';
import styles from './Classroom.css';
import ContentVideo from './ContentVideo';
import Controls from './Controls';
import DeviceSwitcher from './DeviceSwitcher';
import Error from './Error';
import LoadingSpinner from './LoadingSpinner';
import LocalVideo from './LocalVideo';
import RemoteVideoGroup from './RemoteVideoGroup';
import Roster from './Roster';
import ScreenPicker from './ScreenPicker';
import ScreenShareHeader from './ScreenShareHeader';
import SettingMenu from "./SettingMenu";

const cx = classNames.bind(styles);
import LayerBox from './LayerBox';
import {updateLeaveTime} from "../../api/orgClassroomInfo";


export default function Classroom() {
    const intl = useIntl();
    Modal.setAppElement('body');
    const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
    const [state] = useContext(getUIStateContext());
    const {meetingStatus, errorMessage} = useContext(getMeetingStatusContext());
    const [isContentShareEnabled, setIsContentShareEnabled] = useState(false);
    const [viewMode, setViewMode] = useState(ViewMode.Room);
    const [isModeTransitioning, setIsModeTransitioning] = useState(false);
    const [isPickerEnabled, setIsPickerEnabled] = useState(false);
    const [deviceData, setdeviceData] = useState({});
    const [isOpenLayer, setIsOpenLayer] = useState(false);
    const [devicetransferData, setDevicetransferData] = useState({type: "",});
    const [hideRemoteVideo, setHideRemoteVideo] = useState(false);
    const [hideSider, setHideSider] = useState(false);
    const [hideControl, setHideControl] = useState(false);
    const updateLeaveInfo=()=>{
        if(chime?.title&&chime?.name){

            updateLeaveTime({
                classNum: chime?.title,
                userName: chime?.name
            }).then((response:any)=>{
                console.log(response)
            })
        }
    }
    useEffect(()=>{
        let ignore=false
        let timer:any;
        updateLeaveInfo()
        if(!ignore){

            timer=setInterval(()=>{
                updateLeaveInfo()
            },10*1000)
        }
        return()=>{
            ignore=true;
            clearInterval(timer)
        }
    },[])
    document.title=intl.formatMessage({id:'CreateOrJoin.pageClassRoomTitle'},{roomCode:chime?.title})
    const stopContentShare = async () => {
        setIsModeTransitioning(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        ipcRenderer.on('chime-disable-screen-share-mode-ack', () => {
            try {
                chime?.audioVideo?.stopContentShare();
            } catch (error) {
                // eslint-disable-next-line
                console.error(error);
            } finally {
                setViewMode(ViewMode.Room);
                setIsModeTransitioning(false);
            }
        });
        ipcRenderer.send('chime-disable-screen-share-mode');
    };

    // Must pass a memoized callback to the ContentVideo component using useCallback().
    // ContentVideo will re-render only when one dependency "viewMode" changes.
    // See more comments in ContentVideo.
    const onContentShareEnabled = useCallback(
        async (enabled: boolean) => {
            if (enabled && viewMode === ViewMode.ScreenShare) {
                await stopContentShare();
            }
            setIsContentShareEnabled(enabled);
        },
        [viewMode]
    );
    const seteviceData = (data: any) => {
        if(data&&data.payload?.attendeeId == chime?.configuration?.credentials?.attendeeId){
            if (data.type == 'DEVICE-TURN-DECEMERA' && data.payload?.cameraState) {
                setIsOpenLayer(true);
                setDevicetransferData(data);
            } else if (data.type == 'DEVICE-TURN-AUTO' && data.payload?.mikeState) {
                setIsOpenLayer(true);
                setDevicetransferData(data);
            } else {
                setdeviceData(data);
            }
        }

    };
    const hideElement = (type: string) => {
        if (type == "0") {
            setHideRemoteVideo(!hideRemoteVideo)
        } else if (type == "1") {
            setHideSider(!hideSider)
        } else if (type == "2") {
            setHideControl(!hideControl)
        }
    }

    if (process.env.NODE_ENV === 'production') {
        useEffect(() => {

            // Recommend using "onbeforeunload" over "addEventListener"
            window.onbeforeunload = async (event: BeforeUnloadEvent) => {
                // Prevent the window from closing immediately
                // eslint-disable-next-line
                event.returnValue = true;
                try {
                    await chime?.leaveRoom(state.classMode === ClassMode.Teacher);
                } catch (error) {
                    // eslint-disable-next-line
                    console.error(error);
                } finally {
                    window.onbeforeunload = null;
                    remote.app.quit();
                }
            };
            return () => {
                window.onbeforeunload = null;
            };
        }, []);
    }


    return (
        <div
            className={cx('classroom', {
                roomMode: viewMode === ViewMode.Room,
                screenShareMode: viewMode === ViewMode.ScreenShare,
                isModeTransitioning,
                isContentShareEnabled
            })}
        >
            {meetingStatus === MeetingStatus.Loading && <LoadingSpinner/>}
            {meetingStatus === MeetingStatus.Failed && (
                <Error errorMessage={errorMessage}/>
            )}
            {meetingStatus === MeetingStatus.Succeeded && (
                <>
                    <>
                        {viewMode === ViewMode.Room&&
                        <SettingMenu onClickFn={hideElement} hideState={{hideSider, hideControl,hideRemoteVideo}} isContentShareEnabled={isContentShareEnabled}></SettingMenu>
                        }
                        <div className={cx('left')} id={'leftBox'}>
                            {viewMode === ViewMode.ScreenShare && (
                                <ScreenShareHeader onClickStopButton={stopContentShare}/>
                            )}
                            <div className={cx('contentVideoWrapper')}>
                                <ContentVideo onContentShareEnabled={onContentShareEnabled}/>
                            </div>

                            <div className={cx('remoteVideoGroupWrapper',{hideRemoteVideo})}>
                                <RemoteVideoGroup
                                    viewMode={viewMode}
                                    isContentShareEnabled={isContentShareEnabled}
                                />
                            </div>

                            <div className={cx('localVideoWrapper',{ hideControl})}>
                                <LayerBox isOPen={isOpenLayer} layerOption={{
                                    content: devicetransferData.type == 'DEVICE-TURN-DECEMERA' ? intl.formatMessage({id: 'Classroom.askaboutcamera'}) : intl.formatMessage({id: 'Classroom.askaboutmike'}),
                                    confirm: intl.formatMessage({id: 'Classroom.layerOkBtn'}),
                                    cancel: intl.formatMessage({id: 'Classroom.layercancelBtn'}),
                                    callback: (type: string) => {
                                        if (type == '0') {
                                            //取消
                                        } else if (type == '1') {
                                            setdeviceData(devicetransferData);
                                            //确定
                                        }

                                        setIsOpenLayer(false);
                                    }

                                }}/>
                                <div className={cx('controls')}>
                                    <Controls
                                        viewMode={viewMode}
                                        deviceData={deviceData}
                                        onClickShareButton={() => {
                                            setIsPickerEnabled(true);
                                        }}
                                    />
                                </div>
                                <div className={cx('localVideo')}>
                                    <LocalVideo/>
                                </div>
                            </div>

                        </div>

                        <div className={cx('right',{hideSider})}>
                           {/* <div className={cx('titleWrapper')}>
                                <div className={cx('title')}>{chime?.title}</div>
                                <div className={cx('label')}>
                                    <FormattedMessage id="Classroom.classroom"/>
                                </div>
                            </div>*/}
                            <div className={cx('deviceSwitcher')}>
                                <DeviceSwitcher/>
                            </div>
                            <div className={cx('roster')}>
                                <Roster/>
                            </div>
                            <div className={cx('chat')}>
                                <Chat deviceMessageCallback={seteviceData}/>
                            </div>
                        </div>
                    </>
                    <Modal
                        isOpen={isPickerEnabled}
                        contentLabel="Screen picker"
                        className={cx('modal')}
                        overlayClassName={cx('modalOverlay')}
                        onRequestClose={() => {
                            setIsPickerEnabled(false);
                        }}
                    >
                        <ScreenPicker
                            onClickShareButton={async (selectedSourceId: string) => {
                                setIsModeTransitioning(true);
                                await new Promise(resolve => setTimeout(resolve, 200));
                                ipcRenderer.on(
                                    'chime-enable-screen-share-mode-ack',
                                    async () => {
                                        try {
                                            setIsPickerEnabled(false);
                                            await chime?.audioVideo?.startContentShareFromScreenCapture(
                                                selectedSourceId
                                            );
                                            setViewMode(ViewMode.ScreenShare);
                                            setIsModeTransitioning(false);
                                        } catch (error) {
                                            // eslint-disable-next-line
                                            console.error(error);
                                            await stopContentShare();
                                        }
                                    }
                                );
                                ipcRenderer.send('chime-enable-screen-share-mode');
                            }}
                            onClickCancelButton={() => {
                                setIsPickerEnabled(false);
                            }}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
}
