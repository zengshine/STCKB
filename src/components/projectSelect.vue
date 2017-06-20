<template>
  <el-dialog v-loading.fullscreen.lock="loadingData" element-loading-text="努力加载中..." title="项目选择" :visible.sync="projectSelect.projectselModalVisible" @open="afterOpenDialog()" size="small" top="8%">
    <div class="self-dialog-body project-select-body">
     <div class="group-select-form">
       <div class="group-select">
         <span>部门：</span>
           <el-popover ref="popoverGroupTree" v-model="groupTreeVisible" placement="bottom-start" width="300" trigger="click">
           <div class="group-tree-ct">
            <div class="group-tree-filter-filed-ct">
                <el-input icon="search" placeholder="输入关键字进行过滤" v-model="filterText">
                </el-input>
            </div>
            <div class="group-tree-body-ct">
             <!--group tree-->
            <el-tree :data="groupData" :props="groupTreeProps" node-key="PK_ID"
            highlight-current default-expand-all :expand-on-click-node="false"
              :filter-node-method="filterNode" @node-click="onSelectGroup"
              :default-checked-keys='[paramsData.GroupID]' :render-content='renderContent' ref="groupTree">
              </el-tree>
            </div>
           </div>
           </el-popover>
          <el-button v-popover:popoverGroupTree><span class="selected-group">{{selectedGroup.Name}}</span><i class="el-icon-caret-bottom self-dropdown-right-icon"></i></el-button>
         </div>
       <div class="year-select">
        <span>年份：</span>
           <el-select v-model="selectedYear" @change="onSelectYear" placeholder="请选择">
            <el-option v-for="item in yearData" :key="item.iYear" :label="item.iYear" :value="item.iYear">
            </el-option>
          </el-select>
       </div>
     </div>
     <div class="project-tree-ct">
      <!--project tree-->
      <el-tree :data="projectData" :props="projectTreeProps"
      highlight-current default-expand-all :expand-on-click-node="false"
       @node-click="onSelectProject"></el-tree>
     </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="projectSelect.projectselModalVisible = false;">取 消</el-button>
      <el-button type="primary" @click="okClick">确 定</el-button>
    </span>
  </el-dialog>
</template>
<style scoped>
.group-select-form{
  line-height: 50px;
}
.group-select-form>div{
display: inline-block;
}
.self-dropdown-right-icon{
  font-size: 12px;
  color: rgb(191, 203, 217);
}
.year-select{
  margin-left: 15px;
}
.selected-group{
  display:inline-block;
  margin-right: 15px;
}
.group-tree-ct{
  height: 350px;
}
.group-tree-filter-filed-ct{
  border-bottom: 1px solid rgba(0, 0, 0, .1);
}
.group-tree-body-ct{
  height: 313px;
  overflow: auto;
}

.project-tree-ct{
  overflow:auto;
}
.year-select>div.el-select{
  vertical-align: middle;
}
</style>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
export default {
  data() {
    return {
      loadingData:false,
      selectedGroup:{},
      selectedYear:new Date().getFullYear(),
      filterText:'',
      groupTreeVisible:false,
      yearData:[],
      groupData: [],
      projectData:[],
      groupTreeProps: {
          children: 'Childrens',
          label: 'Name'
        },
        projectTreeProps: {
          children: 'Childrens',
          label: 'Name'
        },
    }
  },
  created(){
        var vueModel=this;
        this.$bus.$on('userInfo-loaded',()=>{
           vueModel.selectedGroup.PK_ID=vueModel.CurUserInfo[0].FK_GroupID;
           vueModel.selectedGroup.Name=vueModel.CurUserInfo[0].GroupName;
           vueModel.loadProjectData();
         });
  },
  mounted(){
     //初始化当前选择group
     this.loadGroupTreeData();
     this.loadAllYears();
  },
      watch: {
      filterText(val) {
        this.$refs.groupTree.filter(val);
      }
    },
  methods:{
    //element-ui message
    eleMessage(text, type) {
      this.$message({
        message: text,
        type: type,
        duration: 2000,
      });
    },
    calPtTreeCtHeigth () {
      var dialogBodyH = document.querySelector(".project-select-body").clientHeight;
      var formCtH = document.querySelector(".group-select-form").clientHeight;
      document.querySelector(".project-tree-ct").style.height=dialogBodyH-formCtH+'px';
    },
    filterNode(value, data) {
        if (!value) return true;
        return data.Name.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },
    renderContent(h,{node,data,store}){
      return (
        <span>
        <span>
          <span class='self-render-tree-label'>{node.label}</span>
        </span>
        </span>
      );
    },
    afterOpenDialog() {
      var vueModel = this;
      if (this.projectSelect.projectselModalVisible) {
        setTimeout(function () {
          vueModel.calPtTreeCtHeigth();
        }, 0);

      }
    },
    onSelectGroup(data,node,nodelist){
       this.selectedGroup=data;
       this.groupTreeVisible=false;
       this.loadProjectData();
    },
    onSelectYear(year){
      this.selectedYear=year;
      this.loadProjectData();
    },
    onSelectProject(data,node,nodelist){
      if(data.PK_ID!=this.EnumDic.Guid_Empty){
      this.paramsData.ProjectId=data.PK_ID;
      this.$bus.$emit('selectProject');
      }else{
        return false;
      }
    },
    okClick(){
      var vm=this;
      if(this.paramsData.ProjectId){
        vm.projectSelect.projectselModalVisible = false
      }else{
        this.$alert('请选择一个项目！','项目选择',{confirmButtonText:'确定'});
      }
    },
    loadGroupTreeData(){
      var vueModel = this;
      vueModel.$axios.get('/api/UserAndGroup').then((res) => {
      var result = res.data;
      if (result) {
        this.groupData=result;
        setTimeout(()=>{vueModel.initSelectedGroupTreeNode()},1);
      }
    }, (error) => {
      console.log(error);
    });
  },
  initSelectedGroupTreeNode(){
    //var groupLabelNodeList=document.querySelector(".group-tree-body-ct").querySelectorAll(".el-tree-node_label");
  },
    loadAllYears(){
      var vueModel = this;
      vueModel.$axios.get('/api/data?isGetAllYears=true').then((res) => {
      var result = res.data;
      if (result.StateCode==0&&result.Data) {
        this.yearData=result.Data.Years;
      }
    }, (error) => {
      console.log(error);
    });
  },
  loadProjectData(){
    var vm=this;
     vm.loadingData=true;
      vm.$axios.get("/api/Project?isGetAllGroupProject=1&year=" + vm.selectedYear + "&GroupID=" + vm.selectedGroup.PK_ID).then((res) => {
      setTimeout(()=>{
        vm.loadingData=false;
      },0);
      var result = res.data;
      if (result) {
        vm.projectData=result;
      }
    }, (error) => {
       console.log(error);
      setTimeout(()=>{
        vm.loadingData=false;
      },0);
    });
  },

  },
  computed: {
    ...mapState([
      'CurUserInfo','projectSelect','paramsData','EnumDic'
    ]),
  },
}
</script>
