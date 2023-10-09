import axios from "axios";
import qs from "qs";


import store from "../store/index";


export function post(url, params, stringify, config = {
    headers: {}
}, useToken = true) {
    config.headers = config.headers || {};
    return new Promise((resolve, reject) => {
        if (stringify) {
            params = qs.stringify(params)
        }
        if (useToken) {
            config.headers["X-Token"] = store.state.user.token;
            config.headers["Accept-Language"] = store.state.user["Accept-Language"]
        }
        // showDialog({
        //     message: JSON.stringify(config)
        // })
        
        axios.post(url, params, config).then(res => {
            if(!(res.status == 200 && res.data && res.data.msgCode == 200)) {
                reject(res);
                return;
            }
            // console.log(res)
            resolve(res["data"]["content"])
            // alert(JSON.stringify(res))
            // alert(JSON.stringify(config))
        }).catch(err => {
            reject(err)
            alert(JSON.stringify(err))
            // alert(JSON.stringify(config))
        })
    })
}


export function get(url, params, config = {
    headers: {}
}, useToken = true) {
    config.headers = config.headers || {};
    // console.log(url)
    return new Promise((resolve, reject) => {
        if (useToken) {
            config.headers["X-Token"] = store.state.user.token;
            config.headers["Accept-Language"] = store.state.user["Accept-Language"];
        }
        axios.get(url, {
            params,
            ...config
        }).then(res => {

            resolve(res["data"]);
        }).catch(err => {
            reject(err)
        })
    })
}