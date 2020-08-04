import classNames from 'classnames/bind';
import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import styles from './SettingMenu.css'

/*
import { FormattedMessage,useIntl } from 'react-intl';
*/
const cx = classNames.bind(styles);
type Props = {
    onClickFn: (type:string) => void;
    hideState:{
        hideSider:boolean;
        hideControl:boolean;
        hideRemoteVideo:boolean
    }
    isContentShareEnabled:boolean
}


export default function settingMenu(props: Props) {
    const {onClickFn,hideState,isContentShareEnabled} = props
    const [isOpen, setIsopen] = useState(false);
    return (
        <>
            <div className={cx('settingMenuBox', isOpen && 'open')}>
                <div className={cx('controlIcon')} onClick={() => {
                    setIsopen(!isOpen);
                }}>
                    {isOpen && <span><FormattedMessage id='SettingMenu.screen.setting'/></span>}
                    <i className="fas fa-cog"></i>
                </div>
                {
                    isOpen && <div className={cx('menuContent')}>
                        <div className={cx('menuItem')} onClick={() => {
                            onClickFn('1')
                        }
                        }>
                            {!hideState.hideSider?(<span> <FormattedMessage id="SettingMenu.hideBtn.sider"/></span>):<span><FormattedMessage id="SettingMenu.showBtn.sider"/></span>}
                        </div>
                        {
                            isContentShareEnabled &&<div className={cx('menuItem')} onClick={()=>{
                                onClickFn('0')
                            }
                            }>
                                {!hideState.hideRemoteVideo?( <span>隐藏视频区</span>): <span>显示视频区</span>}

                            </div>

                        }

                        <div className={cx('menuItem')} onClick={()=>{
                            onClickFn('2')
                        }
                        }>
                            {!hideState.hideControl?(<span>隐藏底部控制区</span>):<span>显示底部控制区</span>}

                        </div>
                    </div>
                }


            </div>
        </>
    )

}