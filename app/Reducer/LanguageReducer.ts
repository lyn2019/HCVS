
export default function (state:any, action:any) {
    switch(action.type) {
        case 'en':
            return {
                ...state,
                lang:"en"
            }
        case 'cn':
            return {
                ...state,
                lang:"cn"
            }
        case 'error':
            return {
                ...state,
                lang:"jp"
            }
        default:
            return state;
    }
}
