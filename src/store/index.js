import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutation'
import actions from './actions'

Vue.use(Vuex);

const state={
        EnumDic: {
        Guid_Empty:"00000000-0000-0000-0000-000000000000",
        Task_State_Todo: 102001,
        Task_State_Doing: 102002,
        Task_State_Done: 102003,
      },
        CurUserInfo:[],
  taskEdit:{
      taskEditModalVisibel:false,
      title:"",
      editModel:"add",//add 或者 edit
      curBacklogId:"",
      curSprintId:"",
      curTaskId:"",
      FK_StageID:"",
  },
  taskStages:[],
  projectSelect:{
      projectselModalVisible:false,
  },
  memberList: [],
  sprintList: [],
              paramsData: {
                User_ID: "00000000-0000-0000-0000-000000000000",
                ProjectId: "4e6068c9-520a-4885-903b-ae8b8ef25534",
                SprintID: "e6b2b554-2336-41a9-a6b2-2e335d24e991",
                GroupID: "10a19093-a714-43ff-83f6-89011800bb71",
                EmptyID: "00000000-0000-0000-0000-000000000000",
            },
};

export default new Vuex.Store({
state,
mutations,
actions,
});
