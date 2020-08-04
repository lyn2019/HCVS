import classNames from 'classnames/bind';
import styles from './LayerBox.css';
import React, { useState, useEffect } from 'react';

const cx = classNames.bind(styles);
type Props = {
  layerOption: {
    content: string;
    confirm?:string;
    cancel?: string;
    callback?:(type:string)=>void;
  };
  isOPen: boolean;
}


export default function layerBox(props: Props) {
  const { layerOption, isOPen } = props;
  const [isOPenLayerBox, setIsOPenLayerBox] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (!ignore) {
      setIsOPenLayerBox(isOPen);
    }
    return () => {
      ignore = true;
    };
  }, [isOPen]);
  return (
    <>
      {isOPenLayerBox ? (
        <div className={cx('confrimBox')}>
          <div className={cx('content')}>
            <span>{layerOption.content}</span>
          </div>
          <div className={cx('btnBox')}>
            {layerOption.confirm ? (
              <div className={cx('btnItem')} onClick={() => {
                if (layerOption.callback) layerOption.callback('1');
                setIsOPenLayerBox(false);
              }}>
                {layerOption.confirm}
              </div>
            ) : null}
            {layerOption.cancel ? (
              <div className={cx('btnItem')} onClick={() => {
                if (layerOption.callback) layerOption.callback('0');
                setIsOPenLayerBox(false);
              }}>
                {layerOption.cancel}
              </div>
            ) : null
            }
          </div>
        </div>
      ) : null}
    </>
  );
}
