import { deal } from "./storageMethods";
import {
    getUrlParam,
    // getIsWxClient
} from "common/js/commonMethods"

var dl = new deal("user");
// function getUserType() {
//     const uType = getUrlParam("u_type");
//     switch(uType) {
//         case "cfcd208495d565ef66e7dff9f98764da":
//             return getIsWxClient() ? 1 : 0;
//         case "c4ca4238a0b923820dcc509a6f75849b":
//             return getIsWxClient() ? 1 : 0;
//         case "c81e728d9d4c2f636f067f89cc14862c":
//             return 2;
//         case "eccbc87e4b5ce2fe28308fd9f2a7baf3":
//             return 3;
//         default:
//             return undefined;
//     }
// }
// const t = getUserType();
// const type = t != undefined ? t : dl.parse('type') || (getIsWxClient() ? 1 : 0);
// // alert(type)
// dl.setItem({
//     type: type
// })
// alert(type)
// console.log(t,dl.parse('type'),getIsWxClient() ? 1 : 0)
const state = {
    id: dl.parse("id") !== undefined ? dl.parse("id") : null, //微信端用户id
    openId: dl.parse("openId") || null, // 微信公众号，用户openid
    ddUserId: dl.parse("ddUserId") || null, // 钉钉userId
    empName: dl.parse("empName") || null, // 名字
    empCode: dl.parse("empCode") || null, // 工号
    phone: dl.parse("phone") || null, // 手机号
    department: dl.parse("department") || null, // 部门
    headImageUrl: dl.parse("headImageUrl") || null, // 头像
    job: dl.parse("job") || null, // 岗位
    gender: dl.parse("gender") || null, //性别（0-女 1-男）
    idCard: dl.parse("idCard") || null, //身份证号
    warehouseKeepers: dl.parse("warehouseKeepers") || [], //仓库信息
    type: dl.parse('type') !== undefined ? dl.parse('type') : null, // 用户类型(0-司机 1-仓管 2-保安)
    userState: dl.parse('userState') !== undefined ? dl.parse('userState') : 1, //用户状态（0.审核中 1.已注册 2.未注册/新用户）
    // factoryId: dl.parse("factoryId") || null, // 所属分厂id
    // userType: dl.parse("userType") || 0, // 用户类型
    adminJurisdictions: dl.parse("adminJurisdictions") || [], //钉钉用户角色
    havePower: dl.parse("havePower") || false, // 是否有用户权限
    loginFail: dl.parse("loginFail") || false, // 是否登录失败（登录接口走了catch回调）
    logined: dl.parse('logined') || false,
    token:  getUrlParam("token") || dl.parse('token') || null,
    "Accept-Language": getUrlParam("Accept-Language") || dl.parse('Accept-Language') || null,
    // centerCode: dl.parse('centerCode') || null, //所属中心的地区码
    
}

const getters = {
    user: (state) => {
        const {
            id,
            openId,
            ddUserId,
            empName,
            empCode,
            headImageUrl,
            department,
            job,
            logined,
            type,
            havePower,
            phone,
            idCard,
            warehouseKeepers,
            userState,
            adminJurisdictions
        } = state;
        return {
            id,
            openId,
            ddUserId,
            empName,
            empCode,
            headImageUrl,
            department,
            job,
            logined,
            type,
            havePower,
            phone,
            idCard,
            warehouseKeepers,
            userState,
            adminJurisdictions
        }
    },
}

const mutations = {
    changeState(state, obj) {
        // alert(JSON.stringify(obj))
        for(let key in obj) {
            state[key] = obj[key];
            dl.setItem({
                [key]: obj[key]
            })
        }
    }
}

const actions = {
    updateUserInfo(tools) {
        const {
            rootGetters
        } = tools;
        console.log(rootGetters)
    }
}
export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}