import {message} from 'antd';

export default function toast(content:any,type:string){
    message.destroy();
    if(type&&type=='error'){
        message.error(content);
    }else if(type&&type=='success'){
        message.success(content)
    }else if(type&&type=='loadr'){
        message.info(content)
    }else {
        message.info(content)
    }

}