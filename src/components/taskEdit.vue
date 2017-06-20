<template>
  <el-dialog v-loading.fullscreen.lock="loadingData" element-loading-text="努力加载中..." :title="taskEdit.title" :visible.sync="taskEdit.taskEditModalVisibel" @open="openTaskEditDialog()" @close="closeTaskEditDialog()" size="small" top="8%">
    <el-form :model="taskModel" ref="taskEditForm">
      <div class="self-dialog-body eidt-task-form">
        <!--标题-->
        <div class="form-item-ct form-item-ct-full">
          <div class="form-item-name-ct form-item-name-ct-full">
            <span class="required-field-tag">*</span>
            <span>标题</span>
          </div>
          <div class="form-item-content-ct form-item-content-ct-full">
            <el-form-item  :show-message="false">
              <el-input @blur="evaluateTaskTitle()"  v-model="taskModel.Title" placeholder="请输入标题..."></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="task-title-rule">
          <div class="task-title-evaluation" v-if="titleEvaluationVisible">
            <img :src="evalGrade|evalImgPath" style="height:20px;">
            <span class="task-title-evaluation-result">{{evaluationText}}</span>
          </div>
          <span>
            请使用
            <el-tooltip placement="bottom">
              <div class="task-title-rule-tooptip" slot="content">
                <span class="rule-tooltip-suggestion">
                  动词建议使用：
                </span>
               <span>
                 测试、开发、梳理、修改、立项、规范、验证、制定、改造、验收、升级、完成、上线、提交、编写、确认、跟进、处理、实现、分析、设计、配置、监控、评审、迁移、整改、交付、投产、复核、更换、审计、调研、调试、开通、确定、修订、排查、恢复、设置、备份、搭建、准备、变更、检查、切换、收集、规划、发布、安装、巡检、统计、部署、扩容
               </span>
              </div>
            <a class="task-title-description">动词</a>
            </el-tooltip>
            +内容+
              <el-tooltip placement="bottom">
              <div class="task-title-rule-tooptip" slot="content">
                <span class="rule-tooltip-suggestion">
                  名词建议使用：
                </span>
               <span>
                 方案、问题、数据、功能、平台、需求、流程、环境、材料、汇报、脚本、服务器、工具、架构、事件、初稿、性能、数据库、界面、页面、文件、清单、报表、交易、原型、手册、组件、报告、采购、计划、优化、演练、策略、培训、考试
               </span>
              </div>
             <a class="task-title-description">名词</a>
            </el-tooltip>
            的格式描述，例如：完成银联代付交易限额监控工具的编写与部署
          </span>
        </div>
        <!--工作量-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
               <span class="required-field-tag">*</span>
            <span>预计工作量：</span>
          </div>
          <div class="form-item-content-ct">
            <el-form-item prop="Effort">
              <el-input-number v-model="taskModel.Effort"></el-input-number>
            </el-form-item>
          </div>
        </div>
        <!--责任人-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
               <span class="required-field-tag">*</span>
            <span>责任人：</span>
          </div>
          <div class="form-item-content-ct">
            <el-form-item prop="FK_OwnerID">
              <el-select v-model="taskModel.FK_OwnerID" placeholder="请选择">
                <el-option v-for="item in memberList" :key="item.FK_UserID" :label="item.UserName" :value="item.FK_UserID">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!--backlog-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
               <span class="required-field-tag">*</span>
            <span>Backlog：</span>
          </div>
          <div class="form-item-content-ct">
            <el-form-item prop="BacklogID">
              <el-select v-model="taskModel.FK_BacklogID" placeholder="请选择Backlog">
                <el-option v-for="item in backlogList" :key="item.BacklogID" :label="item.Title" :value="item.BacklogID">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!--sprint-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
            <span class="unrequired-field">Sprint：</span>
          </div>
          <div class="form-item-content-ct">
            <el-form-item prop="FK_BacklogSprintID">
              <el-select v-model="taskModel.FK_BacklogSprintID" placeholder="请选择Sprint">
                <el-option v-for="item in backlogSprints" :key="item.PK_ID" :label="item.Name" :value="item.PK_ID">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!--开始时间-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
            <span class="unrequired-field">开始时间：</span>
          </div>
          <div class="form-item-content-ct">
            <el-form-item prop="StartTime">
              <el-date-picker v-model="taskModel.StartTime" align="right" type="date"></el-date-picker>
            </el-form-item>
          </div>
        </div>
        <!--结束时间-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
            <span class="unrequired-field">结束时间：</span>
          </div>
          <div class="form-item-content-ct">
            <el-form-item prop="EndTime">
              <el-date-picker v-model="taskModel.EndTime" align="right" type="date"></el-date-picker>
            </el-form-item>
          </div>
        </div>
        <!--任务状态-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
            <span class="unrequired-field">任务状态：</span>
          </div>
          <div class="form-item-content-ct">
            <el-radio class="radio" v-model="taskModel.StateID" :label="EnumDic.Task_State_Todo">TO DO</el-radio>
            <el-radio class="radio" v-model="taskModel.StateID" :label="EnumDic.Task_State_Doing">Doing</el-radio>
            <el-radio class="radio" v-model="taskModel.StateID" :label="EnumDic.Task_State_Done">Done</el-radio>
          </div>
        </div>
        <!--task阶段-->
        <div class="form-item-ct">
          <div class="form-item-name-ct">
            <span class="unrequired-field">Task阶段：</span>
          </div>
          <div class="form-item-content-ct">
            <el-select v-model="taskModel.FK_StageID" placeholder="请选择">
              <el-option v-for="item in taskStages" :key="item.PK_ID" :label="item.StageName" :value="item.PK_ID">
              </el-option>
            </el-select>
          </div>
        </div>
        <!--标准-->
        <div class="form-item-ct form-item-ct-full">
          <div class="form-item-name-ct form-item-name-ct-full">
            <span class="unrequired-field">验收标准：</span>
          </div>
          <div class="form-item-content-ct form-item-content-ct-full">
            <el-form-item prop="TaskTarget">
              <el-input v-model="taskModel.TaskTarget"></el-input>
            </el-form-item>
          </div>
        </div>
        <!--备注-->
        <div class="form-item-ct form-item-ct-full" style="margin-top:8px;">
          <div class="form-item-name-ct form-item-name-ct-full" style="vertical-align:top;line-height:15px;">
            <span class="unrequired-field">备注：</span>
          </div>
          <div class="form-item-content-ct form-item-content-ct-full">
            <el-input v-model="taskModel.Deliverables" type="textarea" placeholder="任务描述..." :autosize="{minRows:3}"></el-input>
          </div>
        </div>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="taskEdit.taskEditModalVisibel = false">取 消</el-button>
      <el-button type="primary" :class="{'task-edit-form-unvalid':!isValid}" v-if="taskEdit.editModel=='edit'" @click="updateTaskInfo()">保存</el-button>
      <el-button type="primary" v-if="taskEdit.editModel=='add'" @click="addTask()">新增</el-button>
       <el-button type="primary" v-if="taskEdit.editModel=='derive'" @click="deriveTask()">派生</el-button>
    </span>
  </el-dialog>
</template>
<style>

</style>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex';
//import Vue from 'vue'
export default {
  data() {
    var endTimeVliad = (rule, value, callback) => {
      if (new Date(this.taskModel.StartTime) > new Date(this.taskModel.EndTime)) {
        callback(new Error("结束时间不能小于开始时间"));
      }else{
        callback();
      }
    };
    var effortVliad = (rule, value, callback) => {
      if (this.taskModel.Effort <= 0) {
        callback(new Error("请填写预计工作量!"));
      }else{
        callback();
      }
    };
    return {
      loadingData:false,
      isValid: true,
      taskModel: {
      },
      addTaskModel:{
        ID:"",
        Title:"",
        FK_BacklogID:"",
        FK_BacklogSprintID:"",
        FK_OwnerID:"",
        FK_CreateUserID:"",
        StartTime:"",
        EndTime:"",
        StateID:"",
        Effort:"",
        RemainingWork:"",
        Deliverables:"",
        Reason:"",
        TaskTarget:"",
        FK_StageID:"",
        FK_RequireID:"",
        IsCreateRequireID:false,
      },
        rules: {
        Title: [
          { required: true, trigger: 'blur' }
        ],
        EndTime: [
          { validator: endTimeVliad, trigger: 'change' }
        ],
        FK_OwnerID: [
          { required: true, message: '请选择责任人!', trigger: 'change' }
        ],
        Effort: [
          { validator: effortVliad, trigger: 'blur' }
        ],
        BaclogID: [
          { required: true, message: '请选择Backlog!', trigger: 'change' }
        ],
      },
        addRules: {
        Title: [
          { required: true, trigger: 'blur' }
        ],
        EndTime: [
          { validator: endTimeVliad, trigger: 'change' }
        ],
        FK_OwnerID: [
          { required: true, message: '请选择责任人!', trigger: 'change' }
        ],
        Effort: [
          { validator: effortVliad, trigger: 'blur' }
        ],
        BaclogID: [
          { required: true, message: '请选择Backlog!', trigger: 'change' }
        ],
      },
      titleEvaluationVisible:false,
      evaluationText:"",
      taskVerbS :'(测试|开发|梳理|修改|立项|规范|验证|制定|改造|验收|升级|完成|上线|提交|编写|确认|跟进|处理|实现|分析|设计|配置|监控|评审|迁移|整改|交付|投产|复核|更换|审计|调研|调试|开通|确定|修订|排查|恢复|设置|备份|搭建|准备|变更|检查|切换|收集|规划|发布|安装|巡检|统计|部署|扩容)',
      taskNames :'(方案|问题|数据|功能|平台|需求|流程|环境|材料|汇报|脚本|服务器|工具|架构|事件|初稿|性能|数据库|界面|页面|文件|清单|报表|交易|原型|手册|组件|报告|采购|计划|优化|演练|策略|培训|考试)',
      titleEvaluation:[
        ['你的task被系统无情地嫌弃了。','难过！你的task填写不及格！',' 你的task掉队了！'],
        ['你的task写得还不够给力，加点料吧！','task尚未完美，填写仍需努力！','你的task离完美只差一步！'],
        ['WOW,good task,希望你说到做到！','task填写满分！加油早日验收吧','好的task是成功的一半！']
      ],
      evalGrade:0,
      backlogList: [],
      backlogSprints: [],
    };
  },
  methods: {
    //element-ui message
    eleMessage(text, type) {
      this.$message({
        message: text,
        type: type,
        duration: 2000,
      });
    },
    initAddTaskModel() {
            var nowTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
            if (nowTime.getDay() == 6) {
                var startTime = new Date(nowTime.setDate(nowTime.getDate() + 2));
                var endTime = new Date(nowTime.setDate(nowTime.getDate() + 6));
            } else {
                var startTime = new Date(nowTime.setDate(nowTime.getDate() + (1 - nowTime.getDay())));
                var endTime = new Date(nowTime.setDate(nowTime.getDate() + (5 - nowTime.getDay())));
            }
            this.addTaskModel.Title="";
            this.addTaskModel.Effort=0;
            this.addTaskModel.FK_BacklogID=this.taskEdit.curBacklogId;
            this.addTaskModel.FK_BacklogSprintID=this.taskEdit.curSprintId;
            this.addTaskModel.FK_OwnerID=this.CurUserInfo[0].PK_ID;
            this.addTaskModel.FK_StageID=this.taskEdit.FK_StageID;
            this.addTaskModel.StartTime=startTime;
            this.addTaskModel.EndTime=endTime;
            this.addTaskModel.StateID=this.EnumDic.Task_State_Todo;
            this.addTaskModel.TaskTarget="";
            this.addTaskModel.Deliverables="";
    },
    evaluateTaskTitle(){
      var vm=this;
      vm.evalGrade = 0;
      var title =this.taskModel.Title;
            if (!title||!title.Trim()) {
              vm.evaluationText="请填写标题！"
                return;
            }
            var verRegex = new RegExp(vm.taskVerbS);
            var nameRegex = new RegExp(vm.taskNames);
            if (verRegex.test(title)) {
                vm.evalGrade += 1;
            }
            if (nameRegex.test(title)) {
                vm.evalGrade += 1;
            }
            var index = parseInt(3 * Math.random());
            vm.evaluationText=(vm.titleEvaluation[vm.evalGrade][index]);
            vm.titleEvaluationVisible=true;
    },
    loadsingleTask() {
      return this.$axios.get('/api/task?isGetSingleTaskById=true&taskID=' + this.taskEdit.curTaskId);
    },
    loadBacklogList() {
      return this.$axios.get('/api/backlog?IsGetID=1&ProjectId=' + this.paramsData.ProjectId);
    },
    loadBacklogSprints() {
      return this.$axios.get('/api/data?isBacklogSprintByBacklogIdForTskUdp=true&backlogId=' + this.taskEdit.curBacklogId);
    },

    openTaskEditDialog() {
      var vm = this;
      //数据初始化
      vm.titleEvaluationVisible=false;
      if (vm.taskEdit.taskEditModalVisibel) {
        //加载Task,backlogList,backlogSprints,taskStages
        vm.$store.dispatch('loadTaskStages', {
          Guid_Empty: vm.EnumDic.Guid_Empty
        });
        vm.loadingData=true;
        if (vm.taskEdit.editModel == "edit"||vm.taskEdit.editModel == "derive") {
          //编辑Task(可能为派生类型)
          //vm.rules=vm.editRules;
          vm.$axios.all([vm.loadsingleTask(),vm.loadBacklogList(), vm.loadBacklogSprints()]).then(
            vm.$axios.spread((tRes, bRes, sRes) => {
              vm.loadingData=false;
              if (tRes.data.StateCode == 0 && tRes.data.Data){
                vm.taskModel = tRes.data.Data;
                //如果FK_StageID不为空,派生类型，则赋值
                if(this.taskEdit.FK_StageID){
                  vm.taskModel.FK_StageID=this.taskEdit.FK_StageID;
                  vm.taskModel.IsCreateRequireID=true;
                  vm.taskModel.StateID=vm.EnumDic.Task_State_Todo;
                  if(!vm.taskModel.FK_RequireID){
                     vm.taskModel.FK_RequireID=vm.taskModel.ID;
                  }
                  vm.taskModel.ID="";
                }
              }
              if (bRes.data.StateCode == 0 && bRes.data.Data) {
                vm.backlogList.splice(0, vm.backlogList.length, ...bRes.data.Data);
              }
              if (sRes.data.StateCode == 0 && sRes.data.Data) {
                vm.backlogSprints.splice(0, vm.backlogSprints.length, ...sRes.data.Data);
                vm.backlogSprints.unshift({Name:'--请选择Sprint-',PK_ID:null});
              }
            })
          )
        }else if(vm.taskEdit.editModel == "add"){
             //新增Task
          //vm.rules=vm.addRules;
          vm.$axios.all([vm.loadBacklogList(), vm.loadBacklogSprints()]).then(
            vm.$axios.spread((bRes,sRes) => {
              vm.loadingData=false;
              if (bRes.data.StateCode == 0 && bRes.data.Data) {
                vm.backlogList.splice(0, vm.backlogList.length, ...bRes.data.Data);
              }
              if (sRes.data.StateCode == 0 && sRes.data.Data) {
                vm.backlogSprints.splice(0, vm.backlogSprints.length, ...sRes.data.Data);
                vm.backlogSprints.unshift({Name:'--请选择Sprint-',PK_ID:null});
              }
              //自定义taskModel赋值
              vm.initAddTaskModel();
              vm.taskModel=vm.addTaskModel;
            })
          );
        }
      }
      return false;
    },
    closeTaskEditDialog(){
      //this.$refs['taskEditForm'].resetFields();
    },
    formatTaskData(){
      var vm=this;
      var isFormValid=true;
      // this.$refs['taskEditForm'].validate((valid) => {
      //      isFormValid=valid;
      // });
      if(!vm.taskModel.Title){
        this.$alert('请填写标题！','表单验证',{confirmButtonText:'确定'});
        return false;
      }
      if(vm.taskModel.Effort<=0){
        this.$alert('请填写预计工作量！','表单验证',{confirmButtonText:'确定'});
        return false;
      }
      if(!vm.taskModel.FK_OwnerID){
        this.$alert('请选择责任人！','表单验证',{confirmButtonText:'确定'});
        return false;
      }
      if(!vm.taskModel.FK_BacklogID){
        this.$alert('请选择Backlog！','表单验证',{confirmButtonText:'确定'});
        return false;
      }
      if(new Date(this.taskModel.StartTime) > new Date(this.taskModel.EndTime)){
        this.$alert('结束时间必须大于等于开始时间，请重新选择！','表单验证',{confirmButtonText:'确定'});
        return false;
      }
      if (isFormValid) {
        vm.taskModel.FK_UpdateUserID = vm.CurUserInfo[0].PK_ID;
        vm.taskModel.EndTime = new Date(vm.taskModel.EndTime).Format("yyyy-MM-dd hh:mm:ss");
        vm.taskModel.StartTime = new Date(vm.taskModel.StartTime).Format("yyyy-MM-dd hh:mm:ss");
        if (vm.taskEdit.editModel == 'add'||vm.taskEdit.editModel == 'derive') {
          vm.taskModel.FK_CreateUserID = vm.CurUserInfo[0].PK_ID;
        }
        return true;
      } else {
        return false;
      }
    },
    updateTaskInfo(){
      var vm=this;
      if(vm.formatTaskData()){
       vm.loadingData=true;
        this.$axios.post('/api/task/?isUpdate=1',vm.taskModel).then((res)=>{
           this.$bus.$emit('updateTask',vm.taskModel);
           if(res.data.StateCode==1){
            vm.eleMessage(res.data.Message, 'warning');
           }
           vm.loadingData=false;
           console.log(res.data);
        },(error)=>{
           console.log(error);
        });
      }
    },
    addTask(){
      var vm = this;
      if (vm.formatTaskData()) {
        vm.loadingData=true;
        this.$axios.post('/api/task', vm.taskModel).then((res) => {
          this.$bus.$emit('updateTask', vm.taskModel);
          vm.loadingData=false;
          console.log(res.data);
        }, (error) => {
          console.log(error);
            vm.loadingData=false;
        });
      }
    },
    deriveTask(){
      var vm = this;
      if (vm.formatTaskData()) {
        vm.loadingData=true;
        this.$axios.post('/api/task', vm.taskModel).then((res) => {
          this.$bus.$emit('updateTask', vm.taskModel);
          vm.loadingData=false;
          console.log(res.data);
        }, (error) => {
          console.log(error);
            vm.loadingData=false;
        });
      }
    },
  },
  watch: {
    taskModel:{
      handler(newValue, oldValue) {
        var vm=this;
        if (this.$refs.taskEditForm) {
          this.$refs.taskEditForm.validate((valid) => {
            vm.isValid = valid;
          });
        }
      },
      deep: true,
    }
  },
  computed: {
    ...mapState([
      'taskEdit', 'taskStages', 'EnumDic', 'CurUserInfo','sprintList', 'paramsData', 'memberList'
    ]),
  },
  filters:{
    evalImgPath(grade){
       switch(grade){
         case 0:return 'static/img/s-4.png';
         case 1:return 'static/img/s-2.png';
         case 2:return 'static/img/s-1.png';
       }
    }
  }
}
</script>
