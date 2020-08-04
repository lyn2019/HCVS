// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {VideoTileState} from 'amazon-chime-sdk-js';
import classNames from 'classnames/bind';
import React, {useContext, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import useRoster from '../hooks/useRoster';
import useRaisedHandAttendees from '../hooks/useRaisedHandAttendees';
import RosterMenu from "./RosterMenu";
import getUIStateContext from "../context/getUIStateContext";
import RosterAttendeeType from '../types/RosterAttendeeType';
import ClassMode from '../enums/ClassMode';
import styles from './Roster.css';

const cx = classNames.bind(styles);

export default function Roster() {
    const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
    const [state] = useContext(getUIStateContext());
    const roster = useRoster();
    const [videoAttendees, setVideoAttendees] = useState(new Set());
    const [showflag, setShowflag] = useState(false);
    const [coordinate, setCoordinate] = useState({x: 0, y: 0, w: 0})
    const [currentAttendeeId, setCurrentAttendeeId] = useState('')
    const [deviceStatus, setDeviceStatus] = useState({camera:false,muted:false})
    const raisedHandAttendees = useRaisedHandAttendees();
    const intl = useIntl();
    useEffect(() => {
        const tileIds: { [tileId: number]: string } = {};
        // <tileId, attendeeId>
        const realTimeVideoAttendees = new Set();

        const removeTileId = (tileId: number): void => {
            const removedAttendeeId = tileIds[tileId];
            delete tileIds[tileId];
            realTimeVideoAttendees.delete(removedAttendeeId);
            setVideoAttendees(new Set(realTimeVideoAttendees));
        };

        chime?.audioVideo?.addObserver({
            videoTileDidUpdate: (tileState: VideoTileState): void => {
                if (
                    !tileState.boundAttendeeId ||
                    tileState.isContent ||
                    !tileState.tileId
                ) {
                    return;
                }

                if (tileState.active) {
                    tileIds[tileState.tileId] = tileState.boundAttendeeId;
                    realTimeVideoAttendees.add(tileState.boundAttendeeId);
                    setVideoAttendees(new Set(realTimeVideoAttendees));
                } else {
                    removeTileId(tileState.tileId);
                }
            },
            videoTileWasRemoved: (tileId: number): void => {
                removeTileId(tileId);
            }
        });
    }, []);


    let attendeeIds;
    if (chime?.meetingSession && roster) {
        attendeeIds = Object.keys(roster).filter(attendeeId => {
            return !!roster[attendeeId].name;
        });

    }

    return (
        <div className={cx('rosterBox')} id='rosterBox'>
            <RosterMenu show={showflag} position={coordinate} attendeeId={currentAttendeeId} deviceStatus={deviceStatus} onclickMenu={() => {
                setShowflag(false)
            }}/>
            <div className={cx('roster')}>
                {attendeeIds &&
                attendeeIds.map((attendeeId: string) => {
                    const rosterAttendee: RosterAttendeeType = roster[attendeeId];
                    return (
                        <div key={attendeeId} className={cx('attendee')} onContextMenu={e => {
                            if (state.classMode !== ClassMode.Teacher) return;
                            if(attendeeId==chime?.configuration?.credentials?.attendeeId) return;
                            let w = document.getElementById('rosterBox')?.offsetWidth || 0
                            setShowflag(true);
                            let leftBoxW = document.getElementById('leftBox')?.offsetWidth || 0
                            setCoordinate({x: e.nativeEvent.clientX - leftBoxW, y: e.nativeEvent.clientY, w: w})
                            setCurrentAttendeeId(attendeeId)
                            setDeviceStatus({camera:videoAttendees.has(attendeeId),muted:rosterAttendee.muted||false})
                        }}>
                            <div className={cx('name')}>{rosterAttendee.name}</div>
                            {raisedHandAttendees.has(attendeeId) && (
                                <div className={cx('raisedHand')}>
                                  <span
                                      role="img"
                                      aria-label={intl.formatMessage(
                                          {
                                              id: 'Roster.raiseHandAriaLabel'
                                          },
                                          {
                                              name: rosterAttendee.name
                                          }
                                      )}
                                  >
                                    ✋
                                  </span>
                                </div>
                            )}
                            {videoAttendees.has(attendeeId) && (
                                <div className={cx('video')}>
                                    <i className={cx('fas fa-video')}/>
                                </div>
                            )}
                            {typeof rosterAttendee.muted === 'boolean' && (
                                <div className={cx('muted')}>
                                    {rosterAttendee.muted ? (
                                        <i className="fas fa-microphone-slash"/>
                                    ) : (
                                        <i className="fas fa-microphone"/>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
