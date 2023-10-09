// import {
//     device
// } from 'dingtalk-jsapi';

import { post } from "apis/axios";
// import qs from "qs";
import store from "store/index";
// import Compressor from "compressorjs"


function decodeUri(url) {
    const fn = (str) => {
        const newStr = decodeURIComponent(str);
        if(str === newStr) {
            return newStr;
        }
        return fn(newStr)
    }
    return fn(url)
}

//获取base64字符串大小
function getBase64Size(base64) {
    let str = atob(base64.split(',')[1]);
    let bytes = str.length;
    return bytes;
}

//压缩图片
function compressImg(imgFile, maxSize) {
    maxSize = maxSize * 1024;
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.src = imgFile;
        img.onload = function () {
            const _this = this;
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var width = img.width;
            var height = img.height;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(_this, 0, 0, width, height);
            var quality = 1;
            let newBase64Image, resultBlob;
            do {
                newBase64Image = canvas.toDataURL("image/jpeg", quality);
                resultBlob = base64ToBlob(newBase64Image);
                quality = Number((quality - 0.1).toFixed());
            } while (resultBlob.size > maxSize && quality > 0.1);
            resolve(resultBlob);
        
        };
        img.onerror = reject;
    })
}
function base64ToBlob(base64) {
    var arr = base64.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
        type: mime,
    });
}
// 判断是否PC端
function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
          "SymbianOS", "Windows Phone",
          "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) >= 0) {
        flag = false;
        break;
      }
    }
    return flag;
}


// 图片上传
function uploadFiles(list) {
    const beforeImgs = list
      .filter((item) => {
        return !item.file
      })
      .map((item) => {
        return {
          url: item['url'],
          relativeUrl: item["relativeUrl"] ? item["relativeUrl"] : item['url'],
        }
      })
    // console.log(beforeImgs, list)
    return new Promise((resolve, reject) => {
      const newList = list.filter((item) => {
        return item.file
      })
      if (!newList.length) {
        resolve(beforeImgs)
        return
      }
      let fileList = new FormData()
      for (let item of newList) {
        fileList.append('files', item.file, item.file.name)
      }
      const url = `${store.getters.fileUploadHead}/up_files`
    //   this.$loading.open()
      post(url, fileList, false, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }, false)
        .then((res) => {
          // console.log(333, res)
          const imgs = res['data'].map((item) => {
            return {
              url: `${store.getters.fileHead}${item}`,
              relativeUrl: item
            }
          })
          resolve([...beforeImgs, ...imgs])
        //   this.$loading.close() 
        })
        .catch(() => {
        //   this.$toast(`图片上传失败`)
        //   this.$loading.close()
          reject()
        })
    })
  }

function strToArr(str) {
    if(str === "" || str === null || str === undefined) {
        return [];
    }
    return str.split(",");
}

function arrToStr(arr) {
    if(!Array.isArray(arr) || arr === arr.length) {
        return "";
    }
    let str = "";
    for(let index in arr) {
        const item = arr[index];
        if(item === null || item === undefined) {
            continue;
        }
        if(index == 0) {
            str += item;
        } else {
            str += `,${item}`;
        }
    }
    
    return str;
}






function getPath() {
    const url = window.location.href;
    const start = url.indexOf("#/") > -1 ? url.indexOf("#/") + 2 : null;
    const end = url.indexOf("?");
    if(start == null) {
        return "/";
    }
    const path = end > -1 ? url.substring(start, end) : url.substring(start)
    return path;
}

function getUrlParam(key) {
    const url = window.location.href;
    const index = url.indexOf("?");
    if(index < 0) {
        return undefined;
    }
    const str = url.substring(Number(index) + 1);
    const qs = require("qs");
    if(key == undefined) {
        return qs.parse(str);
    } else {
        return qs.parse(str)[key];
    }  
}

function getIsWxClient () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
    }
    return false;
}

// function getRunningEnv() {
//     const {env} = require("dingtalk-jsapi");
//     if(env.platform !== "notInDingTalk") {
//         return 2;
//     }
//     if(getIsWxClient()) {
//         return 1;
//     }
//     return 0;
// }

function getToken() {
    const getters = store.getters;
    const runningEnv = store.runningEnv;
    const url = `${getters.apiHead}/tcyy/get_token`;
    return new Promise((resolve, reject) => {
        post(url, {
            username: runningEnv == 2 ? getters["user/user"]["empCode"] : runningEnv == 1 ? getters["user/user"]["openId"] : getters["user/user"]["openId"] || getters["user/user"]["empCode"]
        }, true, {}, false).then(res => {
            resolve(res["jwtToken"]);
        }).catch(err => {
            reject(err);
        })
    })
}

// 根据客户信息获取对应位置
function getPointsDistance(fromPos, {
    city,
    cusName,
    lng,
    lat
}) {
    // cusName = "丰硕路"
    return new Promise((resolve, reject) => {
        if(lng != null && lng != undefined && lat != null && lat != undefined) {
            var dis = window.$AMap.GeometryUtil.distance([fromPos.lng, fromPos.lat], [lng, lat]);
            resolve({
                distance: (dis).toFixed(2),
                lng,
                lat
            })
            return;
        }

        var placeSearch = new window.$AMap.PlaceSearch({
            // city 指定搜索所在城市，支持传入格式有：城市名、citycode和adcode
            city: city || '全国'
        });
        placeSearch.search(cusName, (status, result) => {
            // 查询成功时，result即对应匹配的POI信息
            // console.log(status, result)
            if (status == "complete") {
                if (!result["poiList"]["pois"].length) {
                    resolve({
                        distance: null,
                        lat: null,
                        lng: null
                    });
                    return;
                }
                const p = result["poiList"]["pois"][0]["location"];
                const pointPos = {
                    lat: p["lat"],
                    lng: p["lng"]
                }
                const dis = window.$AMap.GeometryUtil.distance([fromPos.lng, fromPos.lat], [pointPos.lng, pointPos.lat]);
                resolve({
                    distance: (dis).toFixed(2),
                    ...pointPos
                })
            } else {
                resolve({
                    distance: null,
                    lat: null,
                    lng: null
                })
            }

        }, () => {
            reject(null)
        });
    })
}

function openMapApp({
    lng,
    lat,
    name,
    content,
    useBaidu
}) {
    // console.log(lng,lat,name,useBaidu)
    const isiOS = window.$AMap.Browser.ios; //是否ios终端     
    const gaodeIosUrl = lng && lat ? `iosamap://viewMap?sourceApplication=businessAssistant&poiname=${name}&lat=${lat}&lon=${lng}&dev=1` : `iosamap://poi?sourceApplication=businessAssistant&name=${name}&&dev=1`;
    const gaodeAndroidUrl = lng && lat ? `androidamap://viewMap?sourceApplication=businessAssistant&poiname=${name}&lat=${lat}&lon=${lng}&dev=1` : `androidamap://poi?sourceApplication=businessAssistant&keywords=${name}`;
    const baiduIosUrl = lng && lat ? `baidumap://map/marker?location=${lat},${lng}&title=${name}&content=${content}&src=ios.baidu.openAPIdemo` : `baidumap://map/place/search?query=${name}&src=ios.homa.businessAssistant`;
    const baiduAndroidUrl = lng && lat ? `bdapp://map/marker?location=${lat},${lng}&title=${name}&content=${content}&traffic=on&src=andr.baidu.openAPIdemo` : `bdapp://map/place/search?query=${name}&src=andr.homa.businessAssistant`
    if (isiOS) {
        if(!useBaidu) {
            window.location.href = gaodeIosUrl;  
        } else {
            window.location.href = baiduIosUrl;           
        }
    } else {
        if(!useBaidu) {
            window.location.href = gaodeAndroidUrl;
            
        } else {
            window.location.href = baiduAndroidUrl;
            
        }
    }
    
}


//高德坐标转百度（传入经度、纬度）
// function bd_encrypt(gg_lng, gg_lat) {
//     var X_PI = Math.PI * 3000.0 / 180.0;
//     var x = gg_lng, y = gg_lat;
//     var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
//     var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
//     var bd_lng = z * Math.cos(theta) + 0.0065;
//     var bd_lat = z * Math.sin(theta) + 0.006;
//     return {
//         lat: bd_lat,
//         lng: bd_lng
//     };
// }
function getLocation() {
    return new Promise((resolve) => {
        const geolocation = new window.$AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：5s
            // zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
            noIpLocate: 0,
            GeoLocationFirst: true,
            useNative: true,
            maximumAge: 0
        });
        geolocation.getCurrentPosition((status, result) => {
            // console.log(status, result)
            if (status == 'complete') {
                const {
                    lng,
                    lat
                } = result["position"]
                // const {
                //     lng,
                //     lat
                // } = bd_encrypt(result["position"]["lng"], result["position"]["lat"])
                resolve({
                    flag: true,
                    lat,
                    lng,
                    formattedAddress: result["formattedAddress"],
                    city: result["addressComponent"]["city"]
                })
            } else {
                resolve({
                    flag: false,
                    lat: 22.713232,
                    lng: 113.308579,
                    formattedAddress: "模拟定位地址"
                })
            }
        });
    })
}

// function gaodeLocation() {
//     return new Promise((resolve, reject) => {
//         const geolocation = new window.$AMap.Geolocation({
//             enableHighAccuracy: true, //是否使用高精度定位，默认:true
//             timeout: 10000, //超过10秒后停止定位，默认：5s
//             zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
//         });
//         geolocation.getCurrentPosition((status, result) => {
//             // console.log(result)
//             if (status == 'complete') {
//                 resolve({
//                     lat: result["position"]["lat"],
//                     lng: result["position"]["lng"],
//                 })
//             } else {
//                 reject(result)
//             }
//         });
//     })
// }

// function h5GetLocation() {
//     return new Promise((resolve, reject) => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition((p) => {
//                 resolve({
//                     lat: p.coords.latitude,
//                     lng: p.coords.longitude
//                 });
//             }, (e) => {
//                 reject(e)
//             });
//         } else {
//             reject()
//         }
//     })
// }

// function ddGetLocation() {
//     return new Promise((resolve, reject) => {
//         device.geolocation.get({
//             targetAccuracy: 200,
//             coordinate: 1,
//             withReGeocode: true,
//             useCache: true, //默认是true，如果需要频繁获取地理位置，请设置false
//             onSuccess: function (result) {
//                 // console.log(result)
//                 resolve({
//                     lat: result.latitude,
//                     lng: result.longitude
//                 })
//             },
//             onFail: function () {
//                 reject()
//             }
//         }).catch(() => {
//             reject()
//         });
//     })
// }
export {
    getLocation,
    openMapApp,
    getPointsDistance,
    getToken,
    getUrlParam,
    getIsWxClient,
    getPath,
    // getRunningEnv,
    strToArr,
    arrToStr,
    uploadFiles,
    isPC,
    compressImg,
    getBase64Size,
    decodeUri,
    // getFileUrl
}