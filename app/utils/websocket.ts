import ReconnectingWebSocket from "reconnecting-websocket";

let rws: any = null;
let options = {
    maxRetries: 5
};
let url = "你的url地址";
rws = new ReconnectingWebSocket(url, [], options);

rws.addEventListener("error", (e: any) => {
    if(!rws)return
    console.error(e.message);
});
rws.addEventListener("close", () => {
    if(!rws)return
    rws = null;
    console.info("asset service disconnected.");
});

export function close() {
    if(!rws)return
    rws.close()
}

export function open() {
    if(!rws)return
    rws.open()
}

export function refresh() {
    if(!rws)return
    rws.refresh();
}

export function send(data: any) {
    if(!rws)return
    rws.send(data)
}

export function onMessage(fn:any) {
    if(!rws)return
    rws.addEventListener("message", (e: any) => {
        if (e.data) {
            fn(e.data)
        }
    });
}

export default rws