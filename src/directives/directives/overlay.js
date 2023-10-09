let t = null
function overlay(el, binding) {
    // console.log(999,el, binding)
    clearTimeout(t)
    t = null;
    t = setTimeout(() => {
        // console.log(999,el, binding)
    const obj = binding.value;
    // console.log(66666,obj)
    const nowOverlays = document.querySelectorAll(".overloy-box");
    const body = document.querySelector(obj.tg) || el;
    const nodes = body.children;
    let tipBox = body.querySelector(".tip-box") || document.createElement("div");
    if(obj) {
        if(obj.value) {
            // console.log(el, binding)
            if(nowOverlays.length > 0) {
                tipBox.innerHTML = obj.text || "无权限";
                return;
            }
            const overloyBox = document.createElement("div");
            overloyBox.className = "overloy-box"
            overloyBox.style = `width: 100%;height: 100%; backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center;z-index: 999999;position: absolute;left: 0px;top: 0px;background: rgba(0, 0, 0, ${obj.opacity || .3});`
            tipBox.innerHTML = obj.text || "无权限";
            tipBox.className = "tip-box";
            tipBox.style = "background: rgba(255, 255, 255, .2);color:#ffffff;font-size: 13px;padding: 4px 8px;border-radius: 4px;";
            overloyBox.appendChild(tipBox);
            
            body.style.position = "relative";
            // const viewContainer = document.querySelector("#app");
            // el.style.filter = "blur(2px)"
            // console.log(nodes)
            for(let element of nodes) {
                element.style.filter = "blur(2px)";
            }
            body.appendChild(overloyBox)
        } else {
            nowOverlays.forEach(element => {
                element.remove();
            })
            for(let element of nodes) {
                element.style.filter = "none";
            }
            // body.appendChild(overloyBox)
        }
    }
    })
}

export default {
    name: "overlay",
    beforeUpdate: overlay,
    update: overlay,
    beforeMount: overlay
}