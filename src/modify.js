(res) => {
      var result = res.data;
      debugger
      if (result.StateCode==0&&result.Data) {
        this.taskModel=result.Data;
      }
    }, (error) => {
      debugger
      console.log(error);
    }
        public WebApiResult GetSingleTaskById(Boolean isGetSingleTaskById, Guid taskID )
        {
            WebApiResult webApiResult = new WebApiResult { StateCode = 0 };
            var task = bizTask.GetTaskListByID(taskID);
            if (null != task)
            {
                webApiResult.Data = task;
            }
            else
            {
                webApiResult.StateCode = 1;
                webApiResult.Message = "无Task数据！";
            }

            return webApiResult;
        }
