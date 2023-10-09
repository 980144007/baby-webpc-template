

import { createApp } from 'vue'
import App from './App.vue'
import router from 'router'
// console.log(router)
import store from "store"
import {
    post,
    get
} from "apis/axios";
import lodash from "lodash";
import moment from "moment";
import qs from "qs";
import directives from "directives"
import {
    decodeUri,

} from "common/js/commonMethods";

// import babyScroll from 'components/baby-scroll/index.js';
const vm = createApp(App);
Object.assign(vm.config.globalProperties, {
    post,
    get,
    lodash,
    cloneDeep: lodash.cloneDeep,
    moment,
    qs,
    decodeUri,

})
for(let key in directives) {
    const name = directives[key].name;
    if(!name) continue;
    vm.directive(name, directives[key])
    // vm.use(cms[key])
}
// console.log(vm)
vm.use(router).use(store).mount('#app');
