import classNames from 'classnames/bind';
import React, {useEffect, useState, useContext} from 'react';
import {FormattedMessage} from 'react-intl';
import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import styles from "./Rostercontextmenu.css";
import contextMenu from "../enums/contextMenu";
import getChimeContext from "../context/getChimeContext";
import DeviceControDirect from "../enums/DeviceControDirect";

const cx = classNames.bind(styles);
type Props = {
    show: boolean;
    onclickMenu: () => void;
    position: { x: number, y: number, w: number };
    attendeeId: string
    deviceStatus:{camera:boolean,muted:boolean}
}

export default function rosterContextmenu(props: Props) {
    const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
    const {show, onclickMenu, position, attendeeId,deviceStatus} = props;
    const [visibleFlag, setVisibleFlag] = useState(show)
    const [positionX, setPositionX] = useState(0)
    const [cameraState, setcameraState] = useState(false)
    const [mikeState, setmikeState] = useState(false)
    useEffect(() => {
        let ignore=false;
        let menuItemW = document.getElementById("rosterMenuList")?.offsetWidth || 136;
        if(!ignore){
            setVisibleFlag(show);
           // alert(document.getElementById("rosterMenuList")?.offsetWidth)

            let warperW = position.w
           // alert('warperW - position.x='+warperW+'-'+position.x+'='+(warperW - position.x+', menuItemW='+menuItemW+', istrue='+(warperW - position.x >= menuItemW)))
            if (warperW - position.x >= menuItemW) {
                setPositionX(position.x)
            } else {
                setPositionX(warperW - menuItemW - 30)
            }
            setmikeState(deviceStatus.muted)
            setcameraState(!deviceStatus.camera)
        }
        return()=>{
            ignore=true
        }


    },[deviceStatus,position])

    const sendDevice = (type: string) => {
        chime?.sendMessage(type, {
            attendeeId,
            cameraState:cameraState,
            mikeState:mikeState
        });
    }
    const handleClick = (type: any) => {
        console.log(type)
        switch (type) {
            case contextMenu.camera:
                sendDevice(DeviceControDirect.truncemera);
                //setcameraState(!cameraState)
                break;
            case contextMenu.mike:
                sendDevice(DeviceControDirect.trunaudio);
                //setmikeState(!mikeState)
                break;
            case contextMenu.roster:
                sendDevice(DeviceControDirect.leaveroom);
                break;
        }
        //setContextMenuList(initContextMenuList);
        setVisibleFlag(false)
        onclickMenu();
    }
    return (
        <div>
            {visibleFlag ? (
                <div id='rosterMenuList' className={cx('rosterMenuList')}
                     style={{left: positionX, top: position.y + 15}}>

                    <div className={cx('menuItem')} onClick={() => handleClick(contextMenu.camera)}>
                        <span className={cx('icon')}>
                            {cameraState ? (<i className={'fas fa-video'}/>) : <i className={'fas fa-video-slash'}/>}
                        </span>
                        {cameraState ? (<FormattedMessage id="RosterMenu.allowusecamera"/>) :
                            <FormattedMessage id="RosterMenu.nousecamera"/>}
                    </div>

                    <div className={cx('menuItem')} onClick={() => handleClick(contextMenu.mike)}>
                        <span className={cx('icon')}>
                        {mikeState ? (<span className='icon'><i className={'fas fa-microphone'}/></span>) :
                            <span className='icon'> <i className={'fas fa-microphone-slash'}/></span>}
                        </span>
                        {mikeState ? (<FormattedMessage id="RosterMenu.allowusemike"/>) :
                            <FormattedMessage id="RosterMenu.nousemike"/>}
                    </div>

                    <div className={cx('menuItem')} onClick={() => handleClick(contextMenu.roster)}>
                        <span className={cx('icon')}> <i className={'fas fa-user-times'}/></span>
                        <FormattedMessage id="RosterMenu.kickoutstudent"/>
                    </div>

                    <div className={cx('menuItem')} onClick={() => handleClick('')}>
                        <FormattedMessage id="RosterMenu.close"/>
                    </div>
                </div>
            ) : null}
        </div>
    )

}