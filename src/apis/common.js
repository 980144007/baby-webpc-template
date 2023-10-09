import store from "store";
import {
    post,
    get
} from "apis/axios";
import JSZip from "jszip";
import saveAs from "file-saver";
import moment from "moment";
import { showToast } from "vant";
import "vant/es/toast/style";
import axios from "axios"
import { PDFDocument } from "pdf-lib";
import imgTypes from "common/imgTypes";
// import { biz } from 'dingtalk-jsapi';
// import JSZip from 'jszip'
// import { saveAs } from 'file-saver'
// import {
//     SlLoading
// } from "components"
// const {
//     Loading
// } = SlLoading
// console.log(store)
const {
    getters,
    state
} = store


//根据文件id识别身份证图片内容
function readFileIdOfIdCard(id) {
	if(typeof id === "number") {
		id = JSON.stringify(id);
	}
	const url = `${getters.apiHead}/system/catch_id_num`;
	return new Promise((resolve, reject) => {
		post(url,{fileId: id}).then((resp)=>{
			resolve(resp)
		}).catch(() => {
		    reject({
                message: "识别功能异常"
            })
		})
	})
}

//上传单文件
function uploadFile(file) {
    // console.log(1.5, file)
    const url = `${getters.apiHead}/system/uploadFile`;
    return new Promise((resolve, reject) => {
        
            let theForm = new FormData();
            theForm.append("file", file, file.name);
            post(url, theForm, false, {
                headers: {
                    'Content-Type':'multipart/form-data;'
                }
            })
                .then((res) => {
                    const { body, ...otherInfo } = res
                    // console.log(111, body);
                    
                    if (!body) {
                        // showDialog({
                        //     message: "上传失败：" + JSON.stringify(res),
                        //     // duration: 3000
                        // });      
                        reject({message: "上传失败：" + JSON.stringify(res)});
                        return;
                    }
                    if(body.msgCode !== 200) {
                        reject({message: "上传失败：" + JSON.stringify(res)});
                        return;
                    }
                    // console.log("2.55",file)
                    resolve({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        ...body
                    });
                })
                .catch((err) => {
                    reject({
                        message: "上传失败："+JSON.stringify(err),
                        // duration: 3000
                    });
                    console.log(222, err);
                })
    })
} 



function deleteFiles(fileIds) {
    const url = `${getters.apiHead}/delete_file_by_id`;
    return new Promise((resolve, reject) => {
        post(url, {
            fileIds
        }).then(res => {
            if (res.flag) {
                resolve(res);
            } else {
                reject(res);
            }
        }).catch(err => {
            reject(err);
        })
    })
}

// 根据文件地址打包下载zip压缩包
function toZipDownload(list, zipName) {
    console.log(555,list,zipName)
    return new Promise((resolve, reject) => {
        let emptyNum = 0;
        const zip = new JSZip();
        let requestList = [];
        let successNum = 0;
        let failNum = 0;
        
        function requestFn(p, name, fileSuffix, t, waterText) {
            return new Promise((reso) => {
                const  saveFile = (res) => {
                    const isBase64 = /^data:\S+;base64,/.test(res);
                    if(isBase64) {
                        const base64 = res.replace(/^data:\S+;base64,/, "");
                        t.file(`${name}.${fileSuffix}`, base64, { base64: true });
                        successNum++;
                        reso();
                        return;
                    }
                    if (res.size !== 0) {
                        const fileReader = new FileReader();
                        fileReader.onload = (e) => {
                            const base64 = e.target.result.replace(/^data:\S+;base64,/, "")
                            // console.log(t.files[t.root+name] !== undefined, name)
            
                            t.file(`${name}.${fileSuffix}`, base64, { base64: true });
                            successNum++;
                            // console.log(889999,t.files)
                            reso();
                        };
                        fileReader.readAsDataURL(res);
                        fileReader.onerror = () => {
                            failNum++;
                            reso()
                        };
                    } else {
                        emptyNum++;
                        reso()
                    }
                }
                let headers = {}
                if (fileSuffix.toLowerCase() === "pdf") {

                    downloadPdf({ path: p, fileName: name, fileSuffix, waterText, }, false).then(res => {
                        // console.log(res)
                        saveFile(res)
                    }).catch(() => {
                        failNum++;
                        reso()
                    })
                    return
                } else if (imgTypes.includes(fileSuffix.toLowerCase())) {
                    // console.log(p, name, fileSuffix, waterText,)
                    downloadImg({ path: p, fileName: name, fileSuffix, waterText, }, false, true).then(res => {
                        // console.log(111,res)
                        saveFile(res)
                    }).catch(() => {
                        failNum++;
                        reso()
                    })
                    return
                }
                axios.get(p,
                    {
                        responseType: "blob",
                        headers
                    }
                ).then(res => {
                    res = res.data;
                    saveFile(res)
                }).catch(() => {
                    failNum++;
                    reso()
                })
            })
        }
        const arrFn = (data, target = zip) => {
            if (!Array.isArray(data)) {
                const dataName = data.name !== undefined ? data.name : new Date().getTime();
                if (!data.list) {
                    requestList.push(requestFn(data.path, dataName, data.fileSuffix, target, data.waterText))
                } else {
                    const folder = zip.folder(dataName);
                    arrFn(data.list, folder)
                }
                return;
            }
            for (let item of data) {
                const dataName = item.name !== undefined ? item.name : new Date().getTime();
                if (!item.list) {
                    requestList.push(requestFn(item.path, dataName, item.fileSuffix, target, item.waterText))
                } else {
                    const folder = zip.folder(dataName);

                    arrFn(item.list, folder)
                }

            }
        }
        if (Array.isArray(list)) {
            arrFn(list)
        } else {
            for (let obj in list) {
                arrFn(obj)
            }
        }
        Promise.all(requestList).then(() => {
            if (successNum == 0) {
                showToast.error("下载失败");
                reject();
                return;
            }
            zip.generateAsync({ type: "blob" }).then(function (content) {
                let name = zipName !== undefined ? zipName : moment().format("YYYY-MM-DD HH:mm:ss");
                saveAs(content, name);
                resolve({
                    emptyNum,
                    successNum,
                    failNum
                });
            }).catch(() => {
                reject();
            });

        }).catch(() => {
            reject();
        })
    })


}

function downloadFile({ path, fileName, fileSuffix, waterText, }) {
    const name = fileName !== undefined ? `${fileName}.${fileSuffix}` : `文件下载.${fileSuffix}`
    if (fileSuffix.toLowerCase() === "pdf") {
        return downloadPdf({ path, fileName, fileSuffix, waterText, });
    } if(imgTypes.includes(fileSuffix.toLowerCase())) {
        return downloadImg({ path, fileName, fileSuffix, waterText, })
    }
    return new Promise((resolve, reject) => {
        let headers = {}
        
        axios.get(path, {
            headers,
            responseType: "blob"
        }).then(res => {
            saveAs(res.data, name);
            resolve();
        }).catch(() => {
            reject();
        })
    })

}
function getFilesToPdf(list) {
    const newList = list.map((params) => {
        // const params = 
        // console.log(999,path,
        //     fileName,
        //     fileSuffix,
        //     waterText,
        //     waterTextSize)
            const suffix = params.fileSuffix.toLowerCase();
        if(suffix === "pdf") {
            return new Promise((resolve, reject) => {
                getPdf(params.path).then(res => {
                    PDFDocument.load(res).then(res => resolve({
                        type: "pdf", 
                        params,
                        data: res
                    }))
                }).catch(reject)
            })
        } else if(imgTypes.includes(suffix)) {
            return new Promise((resolve, reject) => {
                getImgWidthWatermark(params).then(res => resolve({type: "image", data: res})).catch(reject)
            })
        }
        
    })
    return new Promise((resolve, reject) => {
        Promise.all(newList).then(async res => {
            // console.log(666,res)
            const pdfDoc = await PDFDocument.create()
            // console.log(pdfDoc)
            for(let {type, params, data} of res) {
                if(type === "pdf") {
                    const pagesIndexes =[...data.getPages().keys()]
                    const pages = await pdfDoc.copyPages(data, pagesIndexes);
                    // console.log(6633,pages)
                    for(let page of pages) {
                        const p = pdfDoc.addPage(page);
                        const {width, height} = p.getSize();
                        const {
                            floor,
                            // PI
                        } = Math;
                        if(height < width) {
                            // p.setRotation((30 * PI / 180).toFixed(2));
                        }
                        // console.log(width, height, p, p.getRotation())
                        const png = getWatermarkCanvas({
                            waterText: params.waterText,
                            waterTextSize: params.waterTextSize,
                            width: width,
                            height: height,
                            wNum: floor(width / 250),
                            hNum: floor(height / 200),
                        });
                        if (png) {
                            const imagePDF = await pdfDoc.embedPng(png);
                            p.drawImage(imagePDF, {
                                x: 0,
                                y: 0,
                                opacity: 0.6,
                            });
                        }
                    }
                } else {
                    const p = pdfDoc.addPage();
                    const {width, height} = p.getSize();
                    const scale = 0.8;
                    const img = await imgResize(data, {width: width * scale, height: height * scale});
                    const ePage = await pdfDoc.embedPng(img);
                    p.drawImage(ePage, {
                        x: width * (1 - scale) / 2,
                        y: height * (1 - scale) / 2
                    })
                }
            }
            const pdfBytes = await pdfDoc.save();
            let blobData = new Blob([pdfBytes], {
                type: "application/pdf;Base64",
            });
            const src = window.URL.createObjectURL(blobData);
            // console.log(pdfDoc)
            resolve(src)
        }).catch(reject)
    })
}
function imgResize(src, {width = 0, height = 0}) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const img = new Image();
        img.src = src;
        img.onload = async () => {
            const mWidth = img.width, mHeight = img.height;
            const wScale = mWidth / width, hScale = mHeight / height;
            const scale = Math.max(wScale, hScale);
            if(scale == 1 || scale == 0) {
                resolve(src);
                return;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            const rWidth = mWidth / scale, rHeight = mHeight / scale;
            ctx.drawImage(img, (width - rWidth) / 2, (height - rHeight) / 2, rWidth, rHeight);
            const mSrc = canvas.toDataURL("image/png");
            resolve(mSrc);  
        }
        img.onerror = () => {
            reject()
        }
    })
}
function getPdf(url) {
    return get(
        url,
        {},
        { responseType: "arraybuffer" },
        2
    )
}
// function getDocFile(path) {
//     return new Promise((resolve, reject) => {
//         axios.get(path, {
//             responseType: "blob"
//         }).then(res => {
//             resolve(res.data);
//         }).catch(() => {
//             reject();
//         })
//     })
// }
function downloadPdf({
    path,
    fileName,
    fileSuffix,
    waterText,
    waterTextSize = null,
}, save = true) {
    
    return new Promise((resolve, reject) => {
        get(
            path,
            {},
            { responseType: "arraybuffer" },
            2
        ).then(async (res) => {
            const pdfDoc = await PDFDocument.load(res);
            const pages = pdfDoc.getPages();
            if (waterText) {
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const { width, height } = page.getSize();
                    const {
                        floor
                    } = Math;
                    const png = getWatermarkCanvas({
                        waterText,
                        waterTextSize,
                        width: width,
                        height: height,
                        wNum: floor(width / 250),
                        hNum: floor(height / 200),
                    });
                    if (png) {
                        const imagePDF = await pdfDoc.embedPng(png);
                        page.drawImage(imagePDF, {
                            x: 0,
                            y: 0,
                            opacity: 0.6,
                        });
                    }
                }
            }

            const pdfBytes = await pdfDoc.save();
            let blobData = new Blob([pdfBytes], { type: "application/pdf;Base64" });
            const src = window.URL.createObjectURL(blobData);
            if (save) {
                saveAs(src, `${fileName}.${fileSuffix}`);
            }
            resolve(blobData)
        }).catch(() => {
            reject()
        });
    })

}
function downloadImg({
    path,
    fileName,
    fileSuffix,
    waterText,
    waterTextSize = null,
}, save = true, needBlob = false) {
    return new Promise((resolve, reject) => {
        getImgWidthWatermark({
            path,
            fileName,
            fileSuffix,
            waterText,
            waterTextSize
        }, needBlob).then(src => {
            if(save) {
                saveAs(src, `${fileName}.${fileSuffix}`);
            }
            resolve(src);
        }).catch(reject)
    })
}
function getWatermarkCanvas({
    waterText = null,
    waterTextSize = null,
    warterColor = "#000000",
    width = null,
    height = null,
    wNum = null,
    hNum = null,
} = {}) {
    const canvas = document.createElement("canvas");
    if (!waterText || !width || !height || !wNum || !hNum) return canvas.toDataURL("image/png");
    
    const {
        PI,
        floor,
        min,
        sin,
        abs
    } = Math;
    // const scale = 1;
    const pWidth = floor(width);
    const pHeight = floor(height);
    
    if (!waterTextSize) {
        const size = floor(min(pWidth / wNum, pHeight / hNum) / (2 * waterText.length));
        waterTextSize = size < 12 ? 12 : size;
    }
    canvas.width = pWidth;
    canvas.height = pHeight;
    
    
    const waterCanvas = document.createElement("canvas");
    const waterCanvasCtx = waterCanvas.getContext("2d");
    // waterCanvasCtx.scale(0.5,0.5)
    const deg = (-30 * PI) / 180;
    waterCanvas.width = floor(pWidth / wNum);
    waterCanvas.height = floor(pHeight / hNum);
    waterCanvasCtx.translate(waterCanvas.width, waterCanvas.height)
    waterCanvasCtx.rotate(deg)
    waterCanvasCtx.translate(-waterCanvas.width, -waterCanvas.height)
    waterCanvasCtx.fillStyle = warterColor.colorRgb(0.2);
    waterCanvasCtx.font = `normal ${waterTextSize}px Arial`;
    waterCanvasCtx.fillText(waterText, waterCanvas.width / 2 - waterText.length / 2, (waterCanvas.height - waterTextSize) / 2) - abs(sin(deg) * waterText.length);
    
    let ctx = canvas.getContext("2d");
    // ctx.scale(0.5,0.5)
    ctx.fillStyle = ctx.createPattern(waterCanvas, "repeat");
    // ctx.scale(0.5,0.5)
    ctx.fillRect(0, 0, pWidth, pHeight);
    
    // const rCanvas = document.createElement("canvas");
    // rCanvas.width = floor(width);
    // rCanvas.height = floor(height);
    // const rContext = rCanvas.getContext("2d");
    // rContext.drawImage(canvas.toDataURL("image/png"), 0, 0, rCanvas.width, rCanvas.height);
    // waterCanvas.style.opacity = "0.3";
    const png = canvas.toDataURL("image/png");
    return png;
}
function getImgWidthWatermark({
    path,
    waterText,
    waterTextSize = null,
    warterColor = "#000000",
    wNum = 3,
    hNum = 3,
}, needBlob = false) {
    return new Promise((resolve, reject) => {
        axios.get(path,
            {
                responseType: "blob",

            }
        ).then(res => {
            res = res.data;
            if (res.size !== 0) {
                const img = new Image();
                img.src = window.URL.createObjectURL(res);
                // resolve(img)
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    // console.log(width, height)
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    // console.log(111, width)
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    const waterSrc = getWatermarkCanvas({
                        waterText,
                        waterTextSize,
                        warterColor,
                        width,
                        height,
                        wNum,
                        hNum,
                    });

                    const waterImg = new Image();
                    waterImg.src = waterSrc;
                    waterImg.onload = () => {
                        ctx.drawImage(waterImg, 0, 0);
                        const bl = dataURLtoBlob(canvas.toDataURL("image/png"))
                        if(!needBlob) {
                            resolve(window.URL.createObjectURL(bl))
                        } else {
                            resolve(bl)
                            
                        }
                        
                    }

                }
            } else {
                resolve()
            }
        }).catch(() => {
            reject()
        })
    })

}
var image = {
    /*将图片路径转为加水印的base64*/

    /* 将图片（路径）转换为Base64 */
    getBase64FromImageURL(url, callback, fileSuffix) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            img = new Image;
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            var base64URL = canvas.toDataURL(`image/${fileSuffix || 'png'}`);
            callback(base64URL);
            canvas = null;
        };
        img.src = url;
    },
    /* 将base64转换为file类型 */
    getFileFromBase64(base64URL, filename) {
        var arr = base64URL.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }
}
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
  return new Blob([u8arr], {type:mime});
}

/**
 * 应用方法-获得图片base64数据和blob数据
 */

// 获取下载类别选项
function getFilesType(params) {
    const url = `${getters.apiHead}/find_file_type_all`;
    return new Promise((resolve, reject) => {
        post(url, params).then(res => {
            if (res.flag) {
                let data = res.data;
                let selections = data.map(item => {
                    item.label = item.name;
                    item.value = item.typeCode;
                    return item;
                })
                resolve(selections);
            } else {
                reject(res.message);
            }

        }).catch(err => {
            reject(err)
        })
    })
}

// 获取下拉框选项（学历、合同单位）
function getSelections(params) {
    const url = `${getters.apiHead}/find_sys_dictionary_data_dictionary_id`;
    return new Promise((resolve, reject) => {
        post(url, params).then(res => {
            if (res.flag) {
                let objs = res.data;
                let selections = {};
                for (let key in objs) {
                    selections[key] = objs[key].map(item => {
                        item.label = item.valueName;
                        item.value = item.valueId;
                        return item;
                    })
                }
                resolve(selections);
            } else {
                reject(res.message);
            }

        }).catch(err => {
            reject(err)
        })
    })
}

// 获取一级部门
function getDepartments() {
    const url = `${getters.apiHead}/find_department`;
    return new Promise((resolve, reject) => {
        post(url).then(res => {
            if (res.flag) {
                resolve(res.data.map(item => {
                    item.label = item.departmentName;
                    item.value = item.id;
                    return item;
                }))
            } else {
                reject(res.message);
            }

        }).catch(err => {
            reject(err)
        })
    })
}



// 导出图片
// function exportFiles(params, keyName = "", isBatch = false) {
//     return new Promise((resolve) => {
//         if (!state.isPc) {
//             window.$toast("请使用电脑端钉钉进行图片下载");
//             resolve(false)
//             return;
//         }
//         const link = `${getters.apiHead}/export_info_zip`
//         post(link, params)
//             .then((res) => {
//                 // console.log(res)
//                 isBatch
//                 keyName
//                 let zip = new JSZip()
//                 const res1 = res.data
//                 for (let item of res1.clientPojos) {
//                     let folder1 = zip.folder(item.fileName);
//                     for (let file of item.clientPojo2s) {
//                         // console.log(file.fileName)
//                         folder1.file(file.fileName, file.base64Str, { base64: true })
//                     }
//                 }
//                 zip.generateAsync({ type: 'blob' }).then((content) => {
//                     saveAs(content, !isBatch ? `${keyName}单批次导出图片` : keyName === "" ? res1.zipName : `${keyName}多批次导出图片`);
//                 })
//                 resolve(true);
//             })
//             .catch(() => {
//                 resolve(false);
//             })
//     })
// }
let exportFiles = function () {
    this.isCancel = false;
}
exportFiles.prototype.exportFiles = function (params, name = "图片压缩包") {
    return new Promise((resolve, reject) => {
        if (!state.isPc) {
            window.$toast("请使用电脑端钉钉进行文件下载");
            resolve(false)
            return;
        }
        this.isCancel = false;
        const link = `${getters.fileUploadHead}/export_info_zip`
        post(link, params)
            .then((res) => {
                if (this.isCancel) {
                    resolve()
                    return;
                }
                if (res.flag) {
                    this.ddDownload(res.message, name).then(() => {
                        resolve()
                    }).catch(() => {
                        reject()
                    }).finally(() => {
                        setTimeout(() => {
                            this.deleteFile({
                                filePath: res.message
                            })
                        }, 3000)
                    })
                } else {
                    reject()
                    window.$toast(`导出${name}失败`);
                }
            })
            .catch(() => {
                reject()
            })
    })
}
exportFiles.prototype.ddDownload = function (path, name = "图片压缩包") {
    return new Promise((resolve, reject) => {
        const filePath = `${getters.fileHead}${path}`;
        // const suffix = filePath.substring(filePath.lastIndexOf('.'))
        if (state.isDdEnv && state.isPc) {
            reject
        } else {
            let a = document.createElement("a");
            a.download = name;
            a.href = filePath;
            // a.click();
            a.remove();
            resolve()
        }
    })

}
exportFiles.prototype.cancel = function (params) {
    this.isCancel = true;
    if (params) {
        this.deleteFile(params);
    }
}

//取消下载或删除下载
exportFiles.prototype.deleteFile = function (params = {}) {
    return new Promise((resolve, reject) => {
        const link = `${getters.fileUploadHead}/cancel_or_del`
        post(link, params)
            .then((res) => {
                if (res.flag) {
                    resolve()
                } else {
                    reject()
                }
            })
            .catch(() => {
                reject()
            })
    })
}
export {
    exportFiles,
    getDepartments,
    getSelections,
    getFilesType,
    toZipDownload,
    downloadFile,
    getFilesToPdf,
    downloadPdf,
    getWatermarkCanvas,
    image,
    deleteFiles,
    getImgWidthWatermark,
    downloadImg,
    imgResize,
    uploadFile,
    readFileIdOfIdCard
}