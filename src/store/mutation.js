import * as types from './mutation-type'

export default{
    [types.ADD_TOTAL_TIME](state,time){
        state.totalTime+=time;
    },
    [types.INIT_TASKSTAGES](state,taskStages){
        state.taskStages.splice(0,state.taskStages.length,...taskStages);
        state.taskStages.unshift({ PK_ID: null, StageName: "N/A" });

    },
}
