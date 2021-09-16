let uploadArea = document.getElementById("upload-box");
let uploadFileCards = document.getElementById("upload-files");
let selectQuality = document.getElementById("selectQuality");
let selectLanguage = document.getElementById("selectLanguage");

let uploadMaxFileSize = 1024 * 1024 * 1024;
let setting = "ebook";
let action = "compress"
let languages = ""

window.onload = function () {
  addUploadEventListener();
  addSettingBtnListener();
};

function addSettingBtnListener() {
  let btns = document.getElementsByClassName("quality");
  for (let btn of btns) {
    btn.addEventListener("click", function () {
      for (let btn0 of document.getElementsByClassName("quality")) {
        btn0.className = "checkbox quality";
      }
      btn.className = "checkbox quality active";
      setting = btn.getAttribute("value");
    });
  }

  btns = document.getElementsByClassName("menu");
  for (let btn of btns) {
    btn.addEventListener("click", function () {
      for (let btn0 of document.getElementsByClassName("menu")) {
        btn0.className = "checkbox menu";
      }
      btn.className = "checkbox menu active";
      action = btn.getAttribute("value");
      if (action === "compress") {
        selectQuality.style.display = "block";
        selectLanguage.style.display = "none";
      } else if (action === "ocr") {
        selectQuality.style.display = "none";
        selectLanguage.style.display = "block";
      }
    });
  }

  btns = document.getElementsByClassName("language");

  for (let btn of btns) {
    btn.addEventListener("click",function(){
      
      if(btn.className.indexOf("active") === -1){
        btn.className = "checkbox language active"
      }else{
        btn.className = "checkbox language"
      }
      languages = ""
      for(let btn0 of document.getElementsByClassName("language")){
        if(btn0.className.indexOf("active") !== -1){
          languages = languages + "," + btn0.getAttribute("value")
        }
      }
      languages = languages.substr(1)
    })
    
  }
}

function addUploadEventListener() {
  uploadArea.addEventListener("click", () => {
    let fileInput = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("style", "visibility:hidden");
    fileInput.setAttribute("multiple", "multiple");
    fileInput.setAttribute("accept", "application/pdf");
    fileInput.addEventListener("change", function () {
      for (let i = 0; i < this.files.length && i < 10; i++) {
        uploadFile(this.files[i]);
      }
    });
    fileInput.click();
  });
}

function wellSize(num) {
  if (num <= 1024) {
    return num + "byte";
  }
  if (num <= 1024 * 1024) {
    return (num / 1024).toFixed(2) + "kb";
  }
  if (num <= 1024 * 1024 * 1024) {
    return (num / 1024 / 1024).toFixed(2) + "mb";
  }
  if (num <= 1024 * 1024 * 1024 * 1024) {
    return (num / 1024 / 1024 / 1024).toFixed(2) + "gb";
  }

  return (num / 1024 / 1024 / 1024 / 1024).toFixed(2) + "tb";
}

function addUploadCard(callback) {
  callback = callback || function () {};
  let addCard = () => {
    let cardHtml = `<div class="upload-file-thumb">
                        <svg style="margin-top:10px" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100"><path d="M136.533604 0.00026a49.119975 49.119975 0 0 0-35.839982 15.359992C91.307627 25.600247 85.33463 38.40024 85.33463 51.200234v921.599532a49.119975 49.119975 0 0 0 15.359992 35.839982 50.545974 50.545974 0 0 0 35.839982 15.359992h750.931619a49.119975 49.119975 0 0 0 35.839981-15.359992 50.546974 50.546974 0 0 0 15.359993-35.839982V290.134113L648.533344 0.00026z" fill="#FF5562"></path><path d="M938.666197 290.133113H699.733318a52.492973 52.492973 0 0 1-51.199974-51.199974V0.00026z" fill="#FFBBC0" ></path><path d="M730.266302 865.332821c-53.759973 0-101.599948-92.212953-127.146935-151.999923-42.666978-17.919991-89.599955-34.132983-134.826931-45.226977-40.10498 26.560987-107.518945 65.760967-159.624919 65.760966-32.426984 0-55.466972-16.212992-63.999968-44.372977-6.826997-23.039988-0.853-39.25298 5.972997-47.786976q20.47999-28.159986 84.479957-28.159986c34.132983 0 77.652961 5.972997 126.292936 17.919991a762.015613 762.015613 0 0 0 91.306954-75.092962c-12.799994-59.73297-26.452987-156.159921 8.532995-200.532898 17.066991-21.332989 43.519978-28.159986 75.092962-18.77299 34.986982 10.239995 47.786976 31.572984 51.999974 47.786976 14.506993 58.026971-51.999974 136.532931-97.332951 182.666907 10.239995 40.10698 23.039988 81.919958 39.25298 120.319939C695.33332 716.799896 772.080281 759.466874 780.666277 806.399851c3.412998 16.212992-1.706999 31.572984-14.506993 44.372977-11.092994 9.332995-23.039988 14.506993-35.839982 14.506993z m-79.359959-129.706935C683.333326 801.332853 714.000311 831.999838 730.266302 831.999838c2.559999 0 5.972997-0.853 11.092995-5.119998 5.972997-5.972997 5.972997-10.239995 5.119997-13.652993-3.412998-17.066991-30.666984-45.226977-95.572951-77.652961zM335.173503 647.732931c-41.812979 0-53.759973 10.239995-57.172971 14.506993-0.853 1.706999-4.266998 5.972997-0.852999 17.919991 2.559999 10.239995 9.332995 20.47999 31.572984 20.479989 27.306986 0 66.559966-15.359992 112.639942-42.666978-33.332983-6.826997-62.292968-10.239995-86.186956-10.239995z m168.959914-5.119997q41.577979 11.725994 81.919959 27.306986c-9.332995-24.746987-17.066991-50.346974-23.892988-75.092962-18.77299 16.212992-38.399981 32.426984-58.026971 47.786976z m105.866947-275.67986c-9.332995 0-16.212992 3.412998-22.186989 10.239994-17.919991 22.186989-19.62699 78.50696-5.972997 150.186924 51.999974-55.466972 80.212959-106.666946 73.332963-133.972932-0.853-4.266998-4.266998-16.212992-28.159986-23.039988a46.412976 46.412976 0 0 0-17.012991-3.413998z" fill="#FFFFFF"></path></svg>
                      </div>
                      <div class="file-links-box" style="display:none">
                        <a class="download_button">点击下载</a>
                        <span class="fileinfo"></span>
                      </div>
                      <div class="upload-error-cover" style="display:none">
                        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30"><path fill="red" d="M512 53.248c129.707008 3.412992 237.739008 48.299008 324.096 134.656S967.339008 382.292992 970.752 512c-3.412992 129.707008-48.299008 237.739008-134.656 324.096S641.707008 967.339008 512 970.752c-129.707008-3.412992-237.739008-48.299008-324.096-134.656S56.660992 641.707008 53.248 512c3.412992-129.707008 48.299008-237.739008 134.656-324.096S382.292992 56.660992 512 53.248z m0 403.456L405.504 350.208c-8.192-8.192-17.579008-12.288-28.16-12.288-10.580992 0-19.796992 3.924992-27.648 11.776-7.851008 7.851008-11.776 17.067008-11.776 27.648 0 10.580992 4.096 19.968 12.288 28.16l106.496 106.496-106.496 106.496c-8.192 8.192-12.288 17.579008-12.288 28.16 0 10.580992 3.924992 19.796992 11.776 27.648 7.851008 7.851008 17.067008 11.776 27.648 11.776 10.580992 0 19.968-4.096 28.16-12.288l106.496-106.496 106.496 106.496c10.923008 10.24 23.552 13.483008 37.888 9.728s23.380992-12.8 27.136-27.136c3.755008-14.336 0.512-26.964992-9.728-37.888L567.296 512l106.496-106.496c8.192-8.192 12.288-17.579008 12.288-28.16 0-10.580992-3.924992-19.796992-11.776-27.648-7.851008-7.851008-17.067008-11.776-27.648-11.776-10.580992 0-19.968 4.096-28.16 12.288L512 456.704z" ></path></svg>          
                        <div style="height:8px"></div>
                        <span class="errorReason"></span>
                      </div>
                      <div class="upload-progress">
                        <div class="progress-bar" style="width: 0%;"></div>
                      </div>
        `;
    let card = document.createElement("div");
    card.className = "upload-file-card";
    card.innerHTML = cardHtml;
    uploadFileCards.prepend(card);
    let progressBar = card.getElementsByClassName("progress-bar")[0];
    let errReason = card.getElementsByClassName("errorReason")[0];
    let uploadErrorCover = card.getElementsByClassName("upload-error-cover")[0];
    let downloadButton = card.getElementsByClassName("download_button")[0];
    let fileinfo = card.getElementsByClassName("fileinfo")[0];
    let fileLinksBox = card.getElementsByClassName("file-links-box")[0];
    let setErrorInfo = function (errorText) {
      progressBar.style.background = "#F56C6C";
      errReason.innerText = errorText;
      uploadErrorCover.style.display = "block";
    };
    callback(
      (percent) => {
        progressBar.style.width = percent + "%";
      },
      (taskID) => {
        let timer = setInterval(() => {
          getTaskStatus(
            taskID,
            function (task) {
              if (task.status === 3 || task.status === 4) {
                clearInterval(timer);
              }
              if (task.status < 3) {
                // 下载进度
                progressBar.style.background = "#ffc940";
                progressBar.style.width = task.progress * 100 + "%";
              }

              if (task.status === 3) {
                progressBar.style.background = "#ffc940";
                progressBar.style.width = task.progress * 100 + "%";
                downloadButton.setAttribute(
                  "href",
                  `/download?taskId=${taskID}`
                );

                if(task.taskType === "compress"){
                  fileinfo.innerHTML = `${task.name} 原大小:<b>${wellSize(
                    task.size
                  )}</b> 压缩后大小:<b>${wellSize(task.size2)}</b>`;
                  fileLinksBox.style.display = "block";
                }else if(task.taskType === "ocr"){
                  fileinfo.innerHTML = `${task.name} 转换完毕`;
                  fileLinksBox.style.display = "block";
                }
               
              }

              if (task.status === 4) {
                progressBar.style.background = "red";
                progressBar.style.width = task.progress * 100 + "%";
                setErrorInfo(`转换失败，原因是:${task.reason}`);
              }
            },
            function () {
              clearInterval(timer);
              setErrorInfo("转换失败");
            }
          );
        }, 500);
      },
      (reason) => {
        setErrorInfo(reason);
      }
    );
  };
  addCard();
}

function getTaskStatus(taskID, callback, errCalback) {
  callback = callback || function () {};
  errCalback = errCalback || function () {};
  let request = new XMLHttpRequest();
  request.open("GET", `/api/task?taskId=${taskID}`);
  request.addEventListener("load", (e) => {
    let resp = JSON.parse(request.response);
    callback(resp);
  });

  request.addEventListener("error", (e) => {
    errCalback("获取状态出错");
  });

  request.send();
}

function uploadFile(file) {
  addUploadCard((setProgress, uploadSuccess, uploadError) => {
    // 检查是否允许上传
    let size = file.size;
    if (size > uploadMaxFileSize) {
      uploadError("超过了上传文件最大限制");
      return;
    }
    ajaxUploadFile(file, setProgress, uploadSuccess, uploadError);
  });
}

function ajaxUploadFile(file, setProgress, uploadSuccess, uploadError) {
  let formData = new FormData();
  formData.append("file", file);
  formData.append("setting", setting);
  formData.append("languages", languages);

  let request = new XMLHttpRequest();
  request.open("POST", `/api/${action}`);
  request.upload.addEventListener("progress", (e) => {
    let percent_complete = (e.loaded / e.total) * 100;
    setProgress(percent_complete);
  });

  request.addEventListener("load", (e) => {
    let resp = JSON.parse(request.response);
    if (request.status === 200) {
      uploadSuccess(resp.taskID);
    }
  });

  request.addEventListener("error", (e) => {
    uploadError("上传出错");
  });

  request.send(formData);
}

function isMobile() {
  var userAgentInfo = navigator.userAgent;
  var mobileAgents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod",
  ];
  var mobile_flag = false;
  for (var v = 0; v < mobileAgents.length; v++) {
    if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
      mobile_flag = true;
      break;
    }
  }
  var screen_width = window.screen.width;
  var screen_height = window.screen.height;
  if (screen_width < 500 && screen_height < 800) {
    mobile_flag = true;
  }
  return mobile_flag;
}
