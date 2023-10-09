
function toScale(el, binding) {
    // console.log(22,el,binding.value)
    var container = el;
    var startDistance = 0;
    var currentDistance = 0;
    var lastScale = 1; // 最后一次放大倍数
    container.addEventListener('touchstart', function (event) {
        if (event.touches.length === 2) { // 判断当前手指数是否为两个
            startDistance = getDistance(event); // 获取当前手指的距离
        }
    });
    // 监听容器的双指移动事件
    container.addEventListener('touchmove', function (event) {
        if (event.touches.length === 2) { // 判断当前手指数是否为两个
            event.preventDefault();
            currentDistance = getDistance(event); // 获取当前手指的距离
            var scale = currentDistance / startDistance; // 计算当前放大倍数
            if(Math.abs(scale - lastScale) < 0.01) return;
            startDistance = currentDistance;
            lastScale = scale;
            binding.value(scale);
        }
    });
    // 监听容器的双指松开事件
    container.addEventListener('touchend', function (event) {
        startDistance = 0; // 重置状态
        currentDistance = 0;
        lastScale = 1;
    });
}
// 计算当前手指的距离
function getDistance(event) {
    var x = event.touches[0].clientX - event.touches[1].clientX;
    var y = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(x * x + y * y);
}
export default {
    name: "scale",
    // beforeUpdate: toScale,
    // update: toScale,
    beforeMount: toScale
}