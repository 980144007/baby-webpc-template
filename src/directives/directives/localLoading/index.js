
let t = null
// import icon from "./images/loading.svg";
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
    // console.log(body,window.getComputedStyle(body, null))
    const borderRadius = window.getComputedStyle(body, null)["border-radius"];
    // nowOverlays.style.[] = borderRadius
    const nodes = body.children;
    let tipBox = body.querySelector(".tip-box") || document.createElement("div");
    if(obj) {
        if(obj.value) {
            // console.log(el, binding)
            const tipText = document.createElement("div");
                tipText.innerHTML = obj.text || "";
                const icon = document.createElement("div");
                icon.innerHTML = `<img src="${new URL('./images/loading.svg', import.meta.url).href}" />`
            // icon.innerHTML = `<svg style="width:50px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-ellipsis"><circle cx="84" cy="50" r="0" fill="#f3b72e"><animate attributeName="r" values="10;0;0;0;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="0s"></animate> <animate attributeName="cx" values="84;84;84;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="0s"></animate></circle> <circle cx="84" cy="50" r="0.0170326" fill="#E8574E"><animate attributeName="r" values="0;10;10;10;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="-0.85s"></animate> <animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="-0.85s"></animate></circle> <circle cx="83.9421" cy="50" r="10" fill="#43A976"><animate attributeName="r" values="0;10;10;10;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="-0.425s"></animate> <animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="-0.425s"></animate></circle> <circle cx="49.9421" cy="50" r="10" fill="#304153"><animate attributeName="r" values="0;10;10;10;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="0s"></animate> <animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="0s"></animate></circle> <circle cx="16" cy="50" r="9.98297" fill="#f3b72e"><animate attributeName="r" values="0;0;10;10;10" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="0s"></animate> <animate attributeName="cx" values="16;16;16;50;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1.7s" repeatCount="indefinite" begin="0s"></animate></circle></svg>`
            if(nowOverlays.length > 0) {
                tipBox.innerHTML = "";
                
                tipBox.append(icon);
                tipBox.append(tipText)
                return;
            }
            const overloyBox = document.createElement("div");
            overloyBox.className = "overloy-box"
            overloyBox.style = `border-radius: ${borderRadius}; width: 100%;height: 100%;  display: flex; justify-content: center; align-items: center;z-index: ${obj.zIndex !== undefined ? obj.zIndex : 9999999};position: absolute;left: 0px;top: 0px;background: rgba(0, 0, 0, ${obj.opacity || .1});`
            tipBox.className = "tip-box";
            tipBox.style = "color:#ffffff;font-size: 13px;padding: 4px 8px;border-radius: 4px;display: flex; flex-direction: column; justify-content: center; align-items: center;";
            tipBox.append(icon);
            tipBox.append(tipText);
            overloyBox.appendChild(tipBox);
            
            body.style.position = "relative";
            // const viewContainer = document.querySelector("#app");
            // el.style.filter = "blur(2px)"
            // console.log(nodes)
            // nodes.forEach(element => {
            //     element.style.filter = "blur(2px)";
            // });
            body.appendChild(overloyBox)
        } else {
            nowOverlays.forEach(element => {
                element.remove();
            })
            for(let index in nodes) {
                if(!nodes[index].style) {
                    continue;
                }
                nodes[index].style.filter = "none";
            }
            // body.appendChild(overloyBox)
        }
    }
    })
}

export default {
    name: "local-loading",
    beforeUpdate: overlay,
    update: overlay,
    beforeMount: overlay
}