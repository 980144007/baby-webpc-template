import { createStore } from 'vuex'
import user from "./user";
import {
    deal
} from "./storageMethods";
import {
    // getRunningEnv,
    isPC,
    // getUrlParam
} from "common/js/commonMethods";


var dl = new deal();
const mutations = {
    set_variables(state, obj) {
        for (let key in obj) {
            state[key] = obj[key];
        }
    },
    setShallowVariables(state, obj) {
        for (let key in obj) {
            state[key] = null;
            state[key] = obj[key];
        }
    },

}

const state = {
    env: 2, // 运行环境（0：本地；1：测试；2：正式）
    isLocal:  false,
    minePageScrollTop: dl.parse('minePageScrollTop') || 0,
    // runningEnv: getRunningEnv(),
    isPc: isPC(),
}

// console.log(33366,state)
const getters = {
    corpId: state => {
        const env = state.env;
        return env == 1 ? "ding136c75c99d8ac62da1320dcb25e91351" : env == 2 ? "ding63065998412cf2f3" : null;
    },
    apiHead: state => {
        const env = state.env;
        const isLocal = state.isLocal;
        return env == 1 ? "https://hrtest.homa.cn/api" : env == 2 ? "https://hr.homa.cn/api" : isLocal ? "/api" : "https://hrtest.homa.cn/api";
    },
    fileHead: state => {
        const env = state.env;
        const isLocal = state.isLocal;
        return env == 1 ? "https://hrtest.homa.cn" : env == 2 ? "https://hr.homa.cn" : isLocal ? "/fileHead" : "https://hrtest.homa.cn";
    },
    fileUploadHead: state => {
        const env = state.env;
        const isLocal = state.isLocal;
        return env == 1 ? "https://jiaju.homa.cn/homazx/api" : env == 2 ? "https://mbonline.homa.cn/homazx/api" : isLocal ? "/api" : "https://jiaju.homa.cn/homazx/api";
    },
}
const store = createStore({
    state() {
        return state
    },
    getters,
    mutations,
    modules: {
        user,
    }
})
export default store