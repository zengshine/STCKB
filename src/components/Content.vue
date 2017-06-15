<template>
  <div class="wrapper">
    <div class="header stckb-header"  v-loading.fullscreen.lock="loadingData" element-loading-text="努力加载中...">
      <div class="project-title self-border-bottom-solid">
        <a href="/pages/managedms/individual_progress.aspx">
        <img class="logo" src="../../static/img/kanbanLogo.png">
        </a>
        <span class="display-name display-name-color">{{ProjectModal.Title}}</span>
        <div class="page-define-btn">
          <i style="display:none" class="el-icon-star-off"></i>
          <i @click="showProjectSelectDialog()" class="glyphicon glyphicon-th-list"></i>
        </div>
      </div>
      <div class="filter-container" :class="[{'filter-container-folded ': !memberListExpanded}]">
        <div class="sprint-filter">
          <span class="sprint-label">月份：</span>
          <el-select v-model="paramsData.SprintID" @change="onSelectSprint" size="small" placeholder="请选择">
            <el-option v-for="item in sprintList" :key="item.SprintID" :label="item.IterationName" :value="item.SprintID">
            </el-option>
          </el-select>
        </div>
        <div class="member-label-ct">
          <label class="member-label">人员：</label>
        </div>
        <div class="member-filter">
          <div class="member-list">
            <span class="member-name" @click="onSelectMember('ALL')" :class="[{'member-selected':selectedMember=='ALL'}]">ALL</span>
            <span class="member-name" :class="[{'member-selected':selectedMember==member.UserName}]" @click="onSelectMember(member.UserName,member.FK_UserID)" v-for="member in memberList">{{member.UserName}}</span>
          </div>
        </div>
        <i @click="toggleMemberExpand" class="memberlist-expand-btn" :class="[memberListExpanded?'el-icon-caret-top': 'el-icon-caret-bottom']"></i>
      </div>
    </div>

    <div class="page-content" style="">
      <!--Task分类导航-->
      <div class="kb-nav-container kb-nav-container-normal stckb-task-satge-nav">
        <div class="backlog-cloumn column-comon task-type-nav-ct self-border-bottom-solid self-border-right-solid self-border-top-solid task-stage-nav">
          <div class="unexpanded-content">
            <span>PB</span>
          </div>
        </div>

        <div class="task-type-cloumn task-type-nav-ct column-comon self-border-right-solid self-border-bottom-solid self-border-top-solid task-stage-nav" @click="toggleTaskColumnExpand(taskType)" v-bind:class="[{'task-type-cloumn-expanded':taskType.expanded}]" v-for="(taskType,stageIndex) in taskTypeList" :key="taskType">
          <div v-if="!taskType.expanded" class="unexpanded-content">
            <span class="collapse-taskstage-name">{{taskType.title}}</span>
            <i :class="[taskType.expanded?'el-icon-arrow-left':'el-icon-arrow-right']" class="unexpand-arrow"></i>
          </div>
          <div v-if="taskType.expanded" class="expanded-content">
            <div class="expanded-top-content self-border-bottom expanded-top-content-border-color">
              <span class="expanded-task-type expanded-task-type-color">{{taskType.title}}</span>
              <i class="el-icon-arrow-left expanded-tasktype-arrow"></i>
            </div>
            <div class="expanded-bottom-content">
              <span v-for="taskState in taskStates">{{taskState}}</span>
            </div>
          </div>
        </div>
      </div>
      <!--Task列表-->

      <div class="bl-wrapper">
        <!--<draggable :options="computedDragOptions('BLWrapper','baclog')" :move="onMove" v-model="ProjectModal.BacklogList">-->
        <div class="height-cal-ct">
        <div class="backloglist-ct" :class="[{'backloglist-ct-collapse':!backlog.expanded}]" v-for="backlog in ProjectModal.BacklogList" :key="backlog">
          <!--Backlog Task列表-->
          <div class="blitem-container" @click="toggleTaskExpanded(backlog,true,$event)">
            <div class="kb-nav-container">
              <div class="backlog-cloumn column-comon self-border-bottom self-border-right">
                <div class="state-column">
                  <div class="backlog-info-ct backlog-info-ct-bg">
                    <div v-if="backlog.expanded">
                    <div class="left-nav-ct-type">【Backlog】</div>
                    <div class="left-nav-ct-name backlog-title-color">{{backlog.Title}}</div>
                    <div>【负责人】{{backlog.repName}}</div>
                    </div>
                    <div v-if="!backlog.expanded">
                    <div class="left-nav-ct-type-collapse">【Backlog】</div>
                    <div class="left-nav-ct-name-collapse backlog-title-color">{{backlog.Title}}</div>
                    </div>
                    <div @click="toggleTaskExpanded(backlog,false,$event)" class="fold-task-arrow-btn">
                      <i class="el-icon-d-arrow-right" :class="[backlog.expanded?'fold-task-arrow-up':'fold-task-arrow-down']"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div class="task-type-cloumn task-stage-contents-ct column-comon self-border-right self-border-bottom" v-bind:class="[{'task-type-cloumn-expanded':taskType.expanded},{'task-type-cloumn-collapse':!backlog.expanded}]" v-for="(taskType,stageIndex) in taskTypeList">
                <transition type="transition" name="flip-item">
                  <div class="state-column-ct" v-if="taskType.expanded&&backlog.expanded">
                    <draggable class="state-column-task" element="div" :move="onMove" :options="computedDragOptions(backlog.BacklogID,taskType.type)" @end="onVDragEnd" @remove="onVDragRemove($event,backlog.BLTask[taskType.type].todoList,EnumDic.Task_State_Todo)" @add="onVDragAdd($event,backlog.BLTask[taskType.type].todoList,EnumDic.Task_State_Todo)" @start="onVDragStart($event,backlog.BLTask[taskType.type].todoList,EnumDic.Task_State_Todo)" v-model="backlog.BLTask[taskType.type].todoList">
                      <transition-group class="draggable-ct" type="transition" :name="'flip-list'">
                        <div class="task-info-ct task-info-ct-bg task-info-ct-border-todo" @click="onSelectedTask(backlog.BacklogID,null,task.PK_ID,null,$event)" :class="[{'task-info-ct-selected-todo':task.PK_ID==selectedTaskID}]" v-for="task in backlog.BLTask[taskType.type].todoList" :key="task">
                          <i class="glyphicon glyphicon-hand-right task-state-change-btn" @click="changeTaskStateByClick(backlog.BLTask[taskType.type],task,$event)"></i>
                          <div class="task-title task-title-color">{{task.Name}}</div>
                          <div class="task-owner">【责任人】{{task.OwnerName}}</div>
                        </div>
                        <div @click="onShowAddTaskModal(backlog.BacklogID,null,taskType.FK_StageID)" class="add-new-class-ct task-info-ct" :key="taskType.type">
                          <span>
                            <i class="el-icon-plus"></i>Task</span>
                        </div>
                      </transition-group>
                    </draggable>

                    <draggable class="state-column-task" element="div" :move="onMove" :options="computedDragOptions(backlog.BacklogID,taskType.type)" @end="onVDragEnd" @remove="onVDragRemove($event,backlog.BLTask[taskType.type].doingList,EnumDic.Task_State_Doing)" @add="onVDragAdd($event,backlog.BLTask[taskType.type].doingList,EnumDic.Task_State_Doing)" @start="onVDragStart($event,backlog.BLTask[taskType.type].doingList,EnumDic.Task_State_Doing)" v-model="backlog.BLTask[taskType.type].doingList">
                      <transition-group class="draggable-ct" type="transition" :name="'flip-list'">
                        <div class="task-info-ct task-info-ct-bg task-info-ct-border-doing" @click="onSelectedTask(backlog.BacklogID,null,task.PK_ID,null,$event)" :class="[{'task-info-ct-selected-doing':task.PK_ID==selectedTaskID}]" v-for="task in backlog.BLTask[taskType.type].doingList" :key="task">
                          <i class="glyphicon glyphicon-hand-right task-state-change-btn" @click="changeTaskStateByClick(backlog.BLTask[taskType.type],task,$event)"></i>
                          <div class="task-title task-title-color">{{task.Name}}</div>
                          <div class="task-owner">【责任人】{{task.OwnerName}}</div>
                          <span class="task-day-num task-day-num-color">{{task.TaskDoingDays||1}}</span>
                        </div>
                      </transition-group>
                    </draggable>

                    <draggable class="state-column-task" element="div" :move="onMove" :options="computedDragOptions(backlog.BacklogID,taskType.type)" @end="onVDragEnd" @remove="onVDragRemove($event,backlog.BLTask[taskType.type].doneList,EnumDic.Task_State_Done)" @add="onVDragAdd($event,backlog.BLTask[taskType.type].doneList,EnumDic.Task_State_Done)" @start="onVDragStart($event,backlog.BLTask[taskType.type].doneList,EnumDic.Task_State_Done)" v-model="backlog.BLTask[taskType.type].doneList">
                      <transition-group class="draggable-ct" type="transition" :name="'flip-list'">
                        <div class="task-info-ct task-info-ct-bg task-info-ct-border-done" @click="onSelectedTask(backlog.BacklogID,null,task.PK_ID,null,$event)" :class="[{'task-info-ct-selected-done':task.PK_ID==selectedTaskID}]" v-for="task in backlog.BLTask[taskType.type].doneList" :key="task">
                          <i v-if="stageIndex<4" class="glyphicon glyphicon-plus task-state-change-btn" @click="onSelectedTask(backlog.BacklogID,null,task.PK_ID,taskType.FK_StageID,$event)"></i>
                          <div class="task-title task-title-color">{{task.Name}}</div>
                          <div class="task-owner">【责任人】{{task.OwnerName}}</div>
                        </div>
                      </transition-group>
                    </draggable>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!--Sprint Task列表-->
          <div class="sptlist-container" :class="[{'sprintlist-ct-collapse':!sprint.expanded}]"  @click="toggleTaskExpanded(sprint,true,$event)" v-for="sprint in backlog.sprintList" v-if="backlog.expanded">
            <div class="kb-nav-container">
              <div class="backlog-cloumn column-comon self-border-bottom self-border-right">
                <div class="state-column">
                  <div class="backlog-info-ct sprint-info-ct sprint-info-ct-bg">
                    <div v-if="sprint.expanded">
                    <div class="left-nav-sprint-type">【Sprint】</div>
                    <div class="left-nav-sprint-name backlog-title-color">{{sprint.Title}}</div>
                    <div class="">【月份】{{sprint.repName}}</div>
                    </div>
                   <div v-if="!sprint.expanded">
                    <div class="left-nav-sprint-type-collapse">【Sprint】</div>
                    <div class="left-nav-sprint-name-collapse backlog-title-color">{{sprint.Title}}</div>
                    </div>
                    <div @click="toggleTaskExpanded(sprint,false,$event)" class="fold-task-arrow-btn">
                      <i class="el-icon-d-arrow-right" :class="[sprint.expanded?'fold-task-arrow-up':'fold-task-arrow-down']"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="task-type-cloumn task-stage-contents-ct column-comon self-border-right self-border-bottom" v-bind:class="[{'task-type-cloumn-expanded':taskType.expanded}]" v-for="(taskType,sprintStageIndex) in taskTypeList" :key="taskType+'sprint'">
                <transition type="transition" name="flip-item">
                  <div class="state-column-ct" v-if="taskType.expanded&&backlog.expanded&&sprint.expanded">

                    <draggable class="state-column-task" element="div" :move="onMove" :options="computedDragOptions(sprint.FK_SprintID+sprint.expanded,taskType.type)" @end="onVDragEnd" @remove="onVDragRemove($event,sprint.STTask[taskType.type].todoList,EnumDic.Task_State_Todo)" @add="onVDragAdd($event,sprint.STTask[taskType.type].todoList,EnumDic.Task_State_Todo)" @start="onVDragStart($event,sprint.STTask[taskType.type].todoList,EnumDic.Task_State_Todo)" v-model="sprint.STTask[taskType.type].todoList">
                      <transition-group class="draggable-ct" type="transition" :name="'flip-list'">
                        <div class="task-info-ct task-info-ct-bg task-info-ct-border-todo" @click="onSelectedTask(backlog.BacklogID,sprint.FK_SprintID,task.PK_ID,null,$event)" v-for="task in sprint.STTask[taskType.type].todoList" :key="task">
                          <i class="glyphicon glyphicon-hand-right task-state-change-btn" @click="changeTaskStateByClick(sprint.STTask[taskType.type],task,$event)"></i>
                          <div class="task-title task-title-color">{{task.Name}}</div>
                          <div class="task-owner">【责任人】{{task.OwnerName}}</div>
                        </div>
                        <div @click="onShowAddTaskModal(backlog.BacklogID,sprint.FK_SprintID,taskType.FK_StageID)" class="add-new-class-ct task-info-ct" :key="sprint">
                          <span>
                            <i class="el-icon-plus"></i>Task</span>
                        </div>
                      </transition-group>

                    </draggable>

                    <draggable class="state-column-task" element="div" :move="onMove" :options="computedDragOptions(sprint.FK_SprintID+sprint.expanded,taskType.type)" @end="onVDragEnd" @remove="onVDragRemove($event,sprint.STTask[taskType.type].doingList,EnumDic.Task_State_Doing)" @add="onVDragAdd($event,sprint.STTask[taskType.type].doingList,EnumDic.Task_State_Doing)" @start="onVDragStart($event,sprint.STTask[taskType.type].doingList,EnumDic.Task_State_Doing)" v-model="sprint.STTask[taskType.type].doingList">
                      <transition-group class="draggable-ct" type="transition" :name="'flip-list'">
                        <div class="task-info-ct task-info-ct-bg task-info-ct-border-doing" @click="onSelectedTask(backlog.BacklogID,sprint.FK_SprintID,task.PK_ID,null,$event)" v-for="task in sprint.STTask[taskType.type].doingList" :key="task">
                          <i class="glyphicon glyphicon-hand-right task-state-change-btn" @click="changeTaskStateByClick(sprint.STTask[taskType.type],task,$event)"></i>
                          <div class="task-title task-title-color">{{task.Name}}</div>
                          <div class="task-owner">【责任人】{{task.OwnerName}}</div>
                          <span class="task-day-num task-day-num-color">{{task.TaskDoingDays||1}}</span>
                        </div>
                      </transition-group>
                    </draggable>

                    <draggable class="state-column-task" element="div" :move="onMove" :options="computedDragOptions(sprint.FK_SprintID+sprint.expanded,taskType.type)" @end="onVDragEnd" @remove="onVDragRemove($event,sprint.STTask[taskType.type].doneList,EnumDic.Task_State_Done)" @add="onVDragAdd($event,sprint.STTask[taskType.type].doneList,EnumDic.Task_State_Done)" @start="onVDragStart($event,sprint.STTask[taskType.type].doneList,EnumDic.Task_State_Done)" v-model="sprint.STTask[taskType.type].doneList">
                      <transition-group class="draggable-ct" type="transition" :name="'flip-list'">
                        <div class="task-info-ct task-info-ct-bg task-info-ct-border-done" @click="onSelectedTask(backlog.BacklogID,sprint.FK_SprintID,task.PK_ID,null,$event)" v-for="task in sprint.STTask[taskType.type].doneList" :key="task">
                          <i v-if="sprintStageIndex<4" class="glyphicon glyphicon-plus task-state-change-btn" @click="onSelectedTask(backlog.BacklogID,sprint.FK_SprintID,task.PK_ID,taskType.FK_StageID,$event)" ></i>
                          <div class="task-title task-title-color">{{task.Name}}</div>
                          <div class="task-owner">【责任人】{{task.OwnerName}}</div>
                        </div>
                      </transition-group>
                    </draggable>
                  </div>
                </transition>
              </div>

            </div>
          </div>
        </div>
        </div>
        <!--</draggable>-->
      </div>
    </div>
    <vtaskedit></vtaskedit>
    <v-project-select></v-project-select>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
import draggable from 'vuedraggable'
import vtaskedit from './taskEdit.vue'
import vProjectSelect from './projectSelect.vue'
export default {
  components: {
    draggable, vtaskedit, vProjectSelect
  },
  data () {
    return {
      loadingData: false,
      LS: {},
      screenWidth: document.body.clientWidth,
      taskTypeList: [
         { title: "需求", type: 'stage_1', expanded: true ,FK_StageID:'880b2c3d-fa01-47ae-866b-05403121d3bc'},
         { title: "设计", type: 'stage_2', expanded: false,FK_StageID:'3881ee8f-9d80-4c7c-8f8d-acfc0ba94c5d' },
         { title: "开发", type: 'stage_3', expanded: true,FK_StageID:'0a264ad0-50e4-4ec7-ad0b-2ba5846503cc' },
         { title: "测试", type: 'stage_4', expanded: false,FK_StageID:'95c49055-4146-4ea5-a021-50d2a6d98cf6'},
         { title: "上线", type: 'stage_5', expanded: false,FK_StageID:'7d062e12-e7f9-44ad-ab71-bfef6cf38d6f'},
         { title: "BUG", type: 'stage_6', expanded: false,FK_StageID:null},
         { title: "其他", type: 'stage_7', expanded: false,FK_StageID:null}
      ],
      taskStates: ["Todo", "Doing", "Done"],
      memberListExpanded: false,
      selectedMember: "ALL",
      selectedTaskID: "",
      ptModalVisible: false,
      dragOptions: {
        animations: 0,
        group: 'DraggableTask',
        disabled: false,
        ghostClass: 'ghost',
      },
      taskUpdateModel: {
        dragTaskStateId: "",
        dragTaskItem: {},
        nList: [],
        oList: [],
        oIndex: 0,
        nIndex: 0,
      },
      ProjectModal: {
        Title: "CMB_电视互动平台",
        BacklogList: [
          {
            BacklogID: "10a19563-a714-43ff-83f6-8903456700bb71",
            Title: "视频增效平台编辑工作台-1",
            repName: "张山",
            expanded: true,
            BLTask: {
              stage_1: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四1", TaskStateID: 102001, PK_ID: 1000001 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四2", PK_ID: 1000002 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四3", PK_ID: 1000003 }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四4", TaskStateID: 102002, PK_ID: 1000004 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四5" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四6" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四", TaskStateID: 102001, PK_ID: 1000005 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_2: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_3: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_4: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_5: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_6: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_7: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
            },
            sprintList: [
              {
                Title: "视频增效平台编辑工作台-sprint1",
                FK_SprintID: '10a19093-a714-43ff-83f6-89011800bb71',
                repName: "张山",
                expanded: true,
                STTask: {
                  stage_1: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计sp", OwnerName: "李四sprint", TaskStateID: 102001 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四", TaskStateID: 102001 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计st", OwnerName: "李四", TaskDoingDays: 3 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四", TaskDoingDays: 3 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_2: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计st", OwnerName: "李四dfd" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_3: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_4: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_5: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_6: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_7: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                },
              }
            ]
          },   {
            BacklogID: "10a19563-a714-43ff-83f6-8903456700bb71",
            Title: "视频增效平台编辑工作台-3",
            repName: "张山",
            expanded: true,
            BLTask: {
              stage_1: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四ddd", TaskStateID: 102001 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四", TaskStateID: 102002 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四", TaskStateID: 102001 }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_2: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_3: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_4: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_5: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_6: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
              stage_7: {
                todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
              },
            },
            sprintList: [
              {
                Title: "视频增效平台编辑工作台-sprint1",
                FK_SprintID: '10a19093-a714-43ff-83f6-89011800bb71',
                repName: "张山",
                expanded: true,
                STTask: {
                  stage_1: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四33" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_2: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_3: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_4: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_5: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_6: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                  stage_7: {
                    todoList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doingList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                    doneList: [{ Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }, { Name: "电视增效的的登陆页和弹窗设计", OwnerName: "李四" }],
                  },
                },
              }
            ]
          },

        ],
      },
    }
  },
  //created
  created() {
    //先获取用户ID,项目ID,室组ID
    var vueModel = this;
    vueModel.ProjectModal = {};
    vueModel.memberList = [];
    vueModel.paramsData.ProjectId = window.projectId;
    //选择了project
     this.$bus.$on('selectProject',()=>{
       this.loadSTCKBTasks(true);
       this.loadMemberList();
       this.projectSelect.projectselModalVisible=false;
     });
     //更新letask
    this.$bus.$on('updateTask',(task)=>{
        this.loadSTCKBTasks();
        this.taskEdit.taskEditModalVisibel=false;
      });
    //判断是否已经选择项目
    vueModel.loadCurUserInfo();
    if(vueModel.paramsData.ProjectId){
      vueModel.loadMemberList();
    }
    //读取localstorage的taskstage折叠状态
    vueModel.LS = this.commom.ls;
    var taskTypeList = vueModel.LS.get("taskTypeList");
    if (taskTypeList) {
      //展开状态赋值
      taskTypeList.forEach((sItem,sIndex)=>{
        vueModel.taskTypeList.forEach((vItem,vIndex)=>{
           if(sItem.FK_StageID==vItem.FK_StageID||sItem.title==vItem.title){
             vItem.expanded=sItem.expanded;
             sItem.FK_StageID=vItem.FK_StageID;
             sItem.title=vItem.title;
           }
        });
      });
    } else {
      vueModel.LS.set("taskTypeList", vueModel.taskTypeList);
    }
  },
  //mounted
  mounted() {
    var vueModel = this;
    window.onresize = () => {
      return (() => {
        setTimeout(function () {
          //计算task容器高度,宽度
          vueModel.calTaskCTHeight();
          vueModel.calTaskCTWidth();
        }, 0);
      })();
    };
    //计算task容器高度,宽度
    this.calTaskCTHeight();
    this.calTaskCTWidth();
  },
  //watch
  watch: {

  },
  //methods
  methods: {
    //element-ui message
    eleMessage(text, type) {
      this.$message({
        message: text,
        type: type,
        duration: 2000,
      });
    },
    isIE() {
      if (!!window.ActiveXObject || "ActiveXObject" in window) {
        return true;
      } else {
        return false;
      }
    },
    //VueDraggable-start
    //options
    computedDragOptions: function (backlogId, stage) {
      return {
        animations: 0,
        group: backlogId + stage,
        disabled: false,
        ghostClass: 'ghost',
      }
    },

    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
    },
    onVDragStart(evt, tasklist, stateId) {
      this.taskUpdateModel.oIndex = evt.oldIndex;
      this.taskUpdateModel.dragTaskItem = tasklist[evt.oldIndex];
    },
    onVDragEnd(evt) {
      return false;
    },
    onVDragAdd(evt, tasklist, stateId) {
      //记录被添加的tasklist
      this.taskUpdateModel.nList = tasklist;
      if (this.taskUpdateModel.dragTaskStateId == stateId) {
        //同一状态
        return false;
      }
      var addedTask = this.taskUpdateModel.dragTaskItem;
      this.taskUpdateModel.nIndex = tasklist.indexOf(addedTask);
      //更改task的stateid属性，（task stateName?）
      addedTask.TaskStateID = stateId;
      //更新taskstate为当前列表state
      this.updateTaskState(addedTask.PK_ID, stateId);
    },
    onVDragRemove(evt, tasklist, stateId) {
      //记录被移除的tasklist
      this.taskUpdateModel.oList = tasklist;
      this.taskUpdateModel.dragTaskStateId = stateId;
    },
    //恢复函数
    stateChangeRollBack() {
      var movedItem = this.taskUpdateModel.nList.splice(this.taskUpdateModel.nIndex, 1)[0];
      this.taskUpdateModel.oList.splice(this.taskUpdateModel.oIndex, 0, movedItem);
    },
    //VueDraggable-end
    //点击改变task状态
    changeTaskStateByClick(taskList, taskItem,evt) {
      //更新为下一状态
      evt.stopPropagation();
      if (taskItem.TaskStateID == this.EnumDic.Task_State_Todo) {
        var oIndex = taskList.todoList.indexOf(taskItem);
        this.taskUpdateModel.oIndex = oIndex;
        this.taskUpdateModel.oList = taskList.todoList;
        this.taskUpdateModel.nList = taskList.doingList;
        var changeTask = taskList.todoList.splice(oIndex, 1)[0];
        changeTask.TaskStateID = this.EnumDic.Task_State_Doing
        taskList.doingList.unshift(changeTask);
      } else if (taskItem.TaskStateID == this.EnumDic.Task_State_Doing) {
        var oIndex = taskList.doingList.indexOf(taskItem);
        this.taskUpdateModel.oIndex = oIndex;
        this.taskUpdateModel.oList = taskList.doingList;
        this.taskUpdateModel.nList = taskList.doneList;
        var changeTask = taskList.doingList.splice(oIndex, 1)[0];
        changeTask.TaskStateID = this.EnumDic.Task_State_Done;
        taskList.doneList.unshift(changeTask);
      } else {
        return false;
      }
      this.taskUpdateModel.nIndex = 0;
      this.updateTaskState(taskItem.PK_ID, taskItem.TaskStateID);
    },
    calNextStage(stageId){
      var vm=this;
      var nextStageId=stageId;
      vm.taskTypeList.every((item,index)=>{
          if(item.FK_StageID==stageId){
            if(index<vm.taskTypeList.length-3){
            nextStageId=this.taskTypeList[index+1].FK_StageID;
              return false;
            }else{
              return false;
            }
          }else{
            return true;
          }
      });
      return nextStageId;
    },
    //编辑task
    onSelectedTask(backlogId,sprintId,taskId,stageId,evt) {
        evt.stopPropagation();
        if(stageId){
          this.taskEdit.FK_StageID=this.calNextStage(stageId);
          this.taskEdit.editModel="derive";
          this.taskEdit.title="派生Task";
        }else{
          this.taskEdit.FK_StageID=stageId;
          this.taskEdit.editModel="edit";
          this.taskEdit.title="编辑Task";
        }
        this.selectedTaskID == taskId ? this.selectedTaskID = "" : this.selectedTaskID = taskId;
        this.taskEdit.curBacklogId=backlogId;
        this.taskEdit.curSprintId=sprintId;
        this.taskEdit.curTaskId=taskId;
        this.taskEdit.taskEditModalVisibel=true;
    },
    //新增task
    onShowAddTaskModal(backlogId,sprintId,taskStageID) {
       this.taskEdit.curBacklogId=backlogId;
       this.taskEdit.curSprintId=sprintId;
       this.taskEdit.FK_StageID=taskStageID;
       this.taskEdit.editModel="add";
       this.taskEdit.title="新增Task";
       this.taskEdit.taskEditModalVisibel=true;
    },
    //计算容器高度
    calTaskCTHeight() {
      var pageH = document.querySelector("body").clientHeight;
      var headerH = document.querySelector(".stckb-header").clientHeight;
      var taskStageNavH = document.querySelector(".stckb-task-satge-nav").clientHeight;
      document.querySelector(".bl-wrapper").style.height = (pageH - headerH - taskStageNavH) + 'px';
    },
    //计算容器宽度
    calTaskCTWidth() {
      var totalW = 0;
      if (this.isIE()) {
        scrollBarWidth = 19;
      }
      var scrollBarWidth = this.calScrollWidth();
      var pageW = document.querySelector("body").clientWidth;
      var stageNavList = document.querySelectorAll(".stckb-task-satge-nav>div.task-stage-nav");
      //计算宽度
      [].slice.call(stageNavList, 0).forEach(function (item) {
        //包含边框宽度
        totalW += item.offsetWidth;
      });
      //判断是否存在竖向滚动条
      var isVerticalScroll=document.querySelector(".bl-wrapper").scrollHeight>document.querySelector(".bl-wrapper").clientHeight;
      if ((totalW <= pageW + 2 || totalW == 640)&&isVerticalScroll) {
        document.querySelector(".bl-wrapper").style.width = pageW + scrollBarWidth + 'px';
      } else {
        document.querySelector(".bl-wrapper").style.width = totalW + 'px';
      }
    },
    calScrollWidth() {
      var noScroll, scroll, oDiv = document.createElement("DIV");
      oDiv.style.cssText = "position:absolute;top:-3000px;width:100px;height:100px;overflow:hidden;";
      noScroll = document.body.appendChild(oDiv).clientWidth;
      oDiv.style.overflowY = "scroll";
      scroll = oDiv.clientWidth;
      document.body.removeChild(oDiv);
      return noScroll - scroll;
    },
    //toggle Task Stage列
    toggleTaskColumnExpand(taskType) {
      var vueModel = this;
      taskType.expanded = !taskType.expanded;
      vueModel.LS.set("taskTypeList", vueModel.taskTypeList);
      //重新计算task 容器宽度；
      setTimeout(function () {
        vueModel.calTaskCTWidth();
      }, 0);
    },
    toggleMemberExpand() {
      this.memberListExpanded = !this.memberListExpanded;
    },
    //选择人员
    onSelectMember(name, userId) {
      this.selectedMember = name;
      if (name == "ALL") {
        this.paramsData.User_ID = this.paramsData.EmptyID;
      } else {
        this.paramsData.User_ID = userId;
      }
      this.loadSTCKBTasks();
    },
    //toggle backlog容器
    toggleTaskExpanded(item,isExpanded,evt) {
      //item:sprint or backlog
       evt.stopPropagation();
      if(isExpanded){
        if(!item.expanded){
        item.expanded=isExpanded
        }
      }else{
      item.expanded = !item.expanded;
      }
    },
    //选择sprint
    onSelectSprint(SprintID) {
      this.paramsData.SprintID = SprintID;
      this.loadSTCKBTasks();
    },
    getTaskStageType(stageId){
      var stageType="";
        this.taskTypeList.every((item,index)=>{
           if(item.FK_StageID==stageId){
             stageType=item.type;
             return false;
           }
        });
        return stageType;
    },
    getTaskStatusType(stateId){
      var statusType
       switch(stateId){
         case this.EnumDic.Task_State_Todo:return 'todoList';
         case this.EnumDic.Task_State_Doing:return 'doingList';
         case this.EnumDic.Task_State_Done:return 'doneList';
         default:return false;
       }
    },
    updateLocalTaskInfo(task){
        var stageType = this.getTaskStageType(task.FK_StageID);
        var statusType = this.getTaskStatusType(task.StateID);
        this.ProjectModal.BacklogList.forEach((bItem, bIndex) => {
          if (bItem.BacklogID == task.FK_BacklogID) {
            如果task直接挂在backlog下
            if (!task.FK_SprintID) {
              bItem.BLTask[stageType][statusType].forEach((tItem, tIndex) => {
                if (tItem.PK_ID == task.ID) {
                  tItem.Name = task.Title;//Title
                  tItem.TaskStateID = task.StateID;
                  tItem.FK_StageID = task.FK_StageID;
                  tItem.BacklogID = task.FK_BacklogID;
                  tItem.FK_SprintID = task.FK_SprintID;
                  tItem.TaskDoingDays = task.TaskDoingDays;
                  tItem.OwnerName = task.OwnerName;
                }
              });
            }
          }
        });
    },
    updateTaskState(taskId, stateId) {
      var vueModel = this;
      //更新任务状态
      vueModel.$axios.get('/api/Task?userID=' + taskId + "&taskID=" + taskId + '&stateID=' + stateId).then((res) => {
        var result = res.data;
        if (result && result.StateCode == 0) {

        } else {
          vueModel.stateChangeRollBack();
          vueModel.eleMessage(result.Message, 'warning');
        }
      }, (error) => {
        vueModel.stateChangeRollBack();
        vueModel.eleMessage("更新Task状态失败", 'warning');
        console.log(error);
      });
    },
    //open projectSelect dialog
    showProjectSelectDialog() {
      this.projectSelect.projectselModalVisible = true;
    },
    loadCurUserInfo(){
      var vueModel=this;
      vueModel.loadingData=true;
      vueModel.$axios.get('/api/Users?isCurrentUser=true').then((res) => {
      vueModel.loadingData=false;
      var result = res.data;
      if (result && result.StateCode == 0) {
        if (result.Data) {
          vueModel.CurUserInfo=[];
          vueModel.CurUserInfo.push(result.Data);
          vueModel.paramsData.GroupID = vueModel.CurUserInfo[0].FK_GroupID;
          if(!vueModel.paramsData.ProjectId){
            vueModel.projectSelect.projectselModalVisible=true;
          }
          vueModel.$bus.$emit('userInfo-loaded');
          vueModel.loadSprintList();
        }else{
          window.location.href='/Pages/Login.aspx'
        }
      }
    }, (error) => {
      vueModel.loadingData = false;
      console.log(error);
    });
    },
    loadSprintList() {
      var vueModel = this;
      //加载sprints
      vueModel.$axios.get('/api/SpringtGet?groupId=' + vueModel.paramsData.GroupID + "&year=" + new Date().getFullYear()).then((res) => {
        var result = res.data;
        if (result && result.StateCode == 0) {
          vueModel.sprintList.splice(0,vueModel.sprintList.length);
           result.Data.forEach(function(item){
                if (item.isCurrent) {
              vueModel.paramsData.SprintID = item.SprintID;
            }
            vueModel.sprintList.push(item);
           });
          vueModel.sprintList.unshift({ isCurrent: 0, IterationName: 'ALL', SprintID: vueModel.EnumDic.Guid_Empty });
          vueModel.loadSTCKBTasks(true);
        } else {
          vueModel.eleMessage(result.Message, 'warning');
          vueModel.loadSTCKBTasks(true);
        }
      }, (error) => {
        vueModel.loadSTCKBTasks(true);
        console.log(error);
      });
    },
    loadMemberList() {
      var vueModel = this;
      //加载memberlist
      vueModel.$axios.get('/api/project?isGetProjectMember=true&projectID=' + vueModel.paramsData.ProjectId).then((res) => {
        var result = res.data;
        if (result && result.StateCode == 0) {
          vueModel.memberList.splice(0,vueModel.memberList.length,...result.Data);
          var isMemberSelected = false;
          vueModel.memberList.forEach(function (item, index) {
            if (item.FK_UserID == vueModel.paramsData.User_ID) {
              vueModel.selectedMember = item.UserName;
              isMemberSelected = true;
            }
          });
          if (!isMemberSelected) {
            vueModel.selectedMember = "ALL";
          }
        }
      }, (error) => {

        console.log(error);
      });
    },
    loadSTCKBTasks(loading) {
      var vueModel = this;
      if(!vueModel.paramsData.ProjectId){
        return false;
      }
      vueModel.loadingData = loading;
      //加载tasks
      vueModel.$axios.get('/api/project?isGetSTCKBData=true&projectId=' + vueModel.paramsData.ProjectId + '&sprintId=' + vueModel.paramsData.SprintID + '&userId=' + vueModel.paramsData.User_ID).then((res) => {
        var result = res.data;
        if (result && result.StateCode == 0) {
          vueModel.ProjectModal = result.Data;
          Vue.nextTick(function(){
            vueModel.calTaskCTWidth();
          });
          vueModel.loadingData = false;
        }
      }, (error) => {
        vueModel.loadingData = false;
        console.log(error);
      });
    },
  },
    //computed
  computed: {
    ...mapState([
      'CurUserInfo','memberList','EnumDic','taskEdit', 'sprintList', 'paramsData', 'projectSelect'
    ]),
  },
}
</script>
<style>
@import "../../static/css/main.css";

/*深色主题*/

@import "../../static/css/color-dark.css";
@import "../../static/css/animation.css";
</style>
<style scoped>
.kb-nav-container {
  display: flex;
  align-items: stretch;
}

.state-column {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.state-column-ct {
  display: flex;
}

.state-column-task {
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.backlog-cloumn {
  flex: 0 0 220px;
}

.task-type-cloumn {
  flex: 1 0 0;
  min-width: 46px;
  box-shadow: 5px 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
}

.task-type-cloumn-expanded {
  flex: 0 0 600px;
}
.task-type-cloumn-collapse{
  box-shadow: none;
  border-right-color:rgba(0, 0, 0, 0);
}
.task-type-cloumn-collapse:nth-child(odd){
  /*box-shadow: 5px 2px 5px rgba(255, 255, 255, 0.1);*/
}
.expanded-top-content {
  line-height: 44px;
  height:44px;
  position: relative;
}

.expanded-bottom-content {
  height: 45px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>
