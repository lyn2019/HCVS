// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames/bind';
import React, {useContext, useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useHistory} from 'react-router-dom';
import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import routes from '../constants/routes.json';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import ViewMode from '../enums/ViewMode';
import styles from './Controls.css';
import Tooltip from './Tooltip';
import {Modal} from 'antd';

const cx = classNames.bind(styles);

enum VideoStatus {
    Disabled,
    Loading,
    Enabled
}

type Props = {
    viewMode: ViewMode;
    deviceData: any;
    onClickShareButton: () => void;
};

export default function Controls(props: Props) {
    const {viewMode, deviceData, onClickShareButton} = props;
    const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
    const [state] = useContext(getUIStateContext());
    const history = useHistory();
    const [muted, setMuted] = useState(false);
    const [focus, setFocus] = useState(false);
    const [videoStatus, setVideoStatus] = useState(VideoStatus.Disabled);
    const [videoVisibleFlag, SetvideoVisibleFlag] = useState(true)
    const [mutedVisibleFlag, SetmutedVisibleFlag] = useState(true)
    const intl = useIntl();
    useEffect(() => {
        let ignore=false;
        if (!ignore&&deviceData?.payload?.attendeeId == chime?.configuration?.credentials?.attendeeId) {
            if (state.classMode == ClassMode.Student && viewMode === ViewMode.Room) {
                eventHandler()
            }

        }
        return()=>{
            ignore=true
        }

    }, [deviceData])
    useEffect(()=>{
        let ignore=false;
        if(!ignore&&state.classMode == ClassMode.Student&& viewMode === ViewMode.Room){
            SetvideoVisibleFlag(false);
            SetmutedVisibleFlag(false)
        }
        return()=>{
            ignore=true
        }

    },[])

    const eventHandler=async ()=>{
        let cameraState = deviceData?.payload?.cameraState;
        let mikeState = deviceData?.payload?.mikeState;
        switch (deviceData.type) {
            case 'DEVICE-TURN-DECEMERA':
              //  videoBtnClickHandler(cameraState)
                await new Promise(resolve => setTimeout(resolve, 10));
                if (cameraState) {
                    SetvideoVisibleFlag(true);
                } else {
                    SetvideoVisibleFlag(false);
                }
                videoBtnClickHandler()

                break;
            case 'DEVICE-TURN-AUTO':
               // mutedClickHandler(mikeState)
                if (mikeState) {
                    SetmutedVisibleFlag(true);
                } else {
                    SetmutedVisibleFlag(false);
                }
                mutedClickHandler()
                break;
            case 'DEVICE-LEAVEROOM':
                Modal.warning({
                    title: intl.formatMessage({id:'Controls.modal.title'}),
                    content:intl.formatMessage({id:'Controls.leaveClassroomRemind'}),
                    onOk() {},
                });
                leaveRoomHandler()
                break;
        }
    }


    const videoBtnClickHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        if (videoStatus === VideoStatus.Disabled) {
            setVideoStatus(VideoStatus.Loading);
            try {
                if (!chime?.currentVideoInputDevice) {
                    throw new Error('currentVideoInputDevice does not exist');
                }
                await chime?.chooseVideoInputDevice(
                    chime?.currentVideoInputDevice
                );
                chime?.audioVideo?.startLocalVideoTile();
                setVideoStatus(VideoStatus.Enabled);
            } catch (error) {
                // eslint-disable-next-line
                console.error(error);
                setVideoStatus(VideoStatus.Disabled);
            }
        } else if (videoStatus === VideoStatus.Enabled) {
            setVideoStatus(VideoStatus.Loading);
            chime?.audioVideo?.stopLocalVideoTile();
            setVideoStatus(VideoStatus.Disabled);

        }
    }

    const mutedClickHandler = async () => {
        if (muted) {
            chime?.audioVideo?.realtimeUnmuteLocalAudio();
        } else {
            chime?.audioVideo?.realtimeMuteLocalAudio();
        }
        // Adds a slight delay to close the tooltip before rendering the updated text in it
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    const leaveRoomHandler = () => {
        chime?.leaveRoom(state.classMode === ClassMode.Teacher);
        history.push(routes.HOME);
    }

    useEffect(() => {
        const callback = (localMuted: boolean) => {
            setMuted(localMuted);
        };
        chime?.audioVideo?.realtimeSubscribeToMuteAndUnmuteLocalAudio(callback);
        return () => {
            if (chime && chime?.audioVideo) {
                chime?.audioVideo?.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(
                    callback
                );
            }
        };
    }, []);
    return (
        <div
            className={cx('controls', {
                roomMode: viewMode === ViewMode.Room,
                screenShareMode: viewMode === ViewMode.ScreenShare,
                videoEnabled: videoStatus === VideoStatus.Enabled,
                audioMuted: muted
            })}
        >
            <div className={cx('micMuted')}>
                <FormattedMessage id="Controls.micMutedInScreenViewMode"/>
            </div>
            {state.classMode === ClassMode.Teacher && viewMode === ViewMode.Room && (
                <Tooltip
                    tooltip={
                        focus
                            ? intl.formatMessage({id: 'Controls.turnOffFocusTooltip'})
                            : intl.formatMessage({id: 'Controls.turnOnFocusTooltip'})
                    }
                >
                    <button
                        type="button"
                        className={cx('focusButton', {
                            enabled: focus
                        })}
                        onClick={() => {
                            const newFocusState = !focus;
                            chime?.sendMessage('focus', {focus: newFocusState});
                            chime?.sendMessage('chat-message', {
                                attendeeId: chime?.configuration?.credentials?.attendeeId,
                                message: newFocusState
                                    ? intl.formatMessage({id: 'Controls.focusOnMessage'})
                                    : intl.formatMessage({id: 'Controls.focusOffMessage'})
                            });
                            setFocus(newFocusState);
                        }}
                    >
                        {focus ? (
                            <i className="fas fa-street-view"/>
                        ) : (
                            <i className="fas fa-street-view"/>
                        )}
                    </button>
                </Tooltip>
            )}
            {mutedVisibleFlag ? (<Tooltip
                tooltip={
                    muted
                        ? intl.formatMessage({id: 'Controls.unmuteTooltip'})
                        : intl.formatMessage({id: 'Controls.muteTooltip'})
                }
            >
                <button
                    type="button"
                    className={cx('muteButton', {
                        enabled: !muted
                    })}
                    onClick={() => {
                        mutedClickHandler()
                    }}
                >
                    {muted ? (
                        <i className="fas fa-microphone-slash"/>
                    ) : (
                        <i className="fas fa-microphone"/>
                    )}
                </button>
            </Tooltip>) : null}

            {videoVisibleFlag ? (<Tooltip
                tooltip={
                    videoStatus === VideoStatus.Disabled
                        ? intl.formatMessage({id: 'Controls.turnOnVideoTooltip'})
                        : intl.formatMessage({id: 'Controls.turnOffVideoTooltip'})
                }
            >
                <button
                    type="button"
                    className={cx('videoButton', {
                        enabled: videoStatus === VideoStatus.Enabled
                    })}
                    onClick={() => {
                        // Adds a slight delay to close the tooltip before rendering the updated text in it
                        videoBtnClickHandler()
                    }}
                >
                    {videoStatus === VideoStatus.Enabled ? (
                        <i className="fas fa-video"/>
                    ) : (
                        <i className="fas fa-video-slash"/>
                    )}
                </button>
            </Tooltip>) : null}

            {state.classMode === ClassMode.Teacher &&
            viewMode !== ViewMode.ScreenShare && (
                <Tooltip
                    tooltip={intl.formatMessage({id: 'Controls.shareScreenTooltip'})}
                >
                    <button
                        type="button"
                        className={cx('shareButton')}
                        onClick={() => {
                            onClickShareButton();
                        }}
                    >
                        <i className="fas fa-desktop"/>
                    </button>
                </Tooltip>
            )}
            {viewMode !== ViewMode.ScreenShare && (
                <Tooltip
                    tooltip={
                        state.classMode === ClassMode.Teacher
                            ? intl.formatMessage({id: 'Controls.endClassroomTooltip'})
                            : intl.formatMessage({id: 'Controls.leaveClassroomTooltip'})
                    }
                >
                    <button
                        type="button"
                        className={cx('endButton')}
                        onClick={() => {
                            leaveRoomHandler()
                        }}
                    >
                        <i className="fas fa-times"/>
                    </button>
                </Tooltip>
            )}
        </div>
    );
}
