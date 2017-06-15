import axios from 'axios'
import EUI from 'element-ui'
import * as types from './mutation-type'

export default {
  addTotalTime({ commit }, time) {
    console.log(1);
    commit(types.ADD_TOTAL_TIME, time)
  },
  loadTaskStages({ commit }, params) {
    axios.get('/api/common?isAllTaskStage=1&companyID=' + params.Guid_Empty).then((res) => {
      var result=res.data;
      if(result.StateCode==0&&result.Data){
       commit(types.INIT_TASKSTAGES,result.Data);
      }
    }, (error) => {
      console.log(error);
      return false;
    });
  },
}
