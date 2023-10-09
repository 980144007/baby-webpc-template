export default {
    name: "mx-length",
    bind(el, binding) {
        el.oninput = () => {
            const maxLength = binding.value || 15;
            const val = el.value;
            if(val.length > maxLength) {
                el.value = val.substring(0, maxLength)
            }
        }
        
    }
}