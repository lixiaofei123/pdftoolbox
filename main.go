package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

var taskService *TaskService

func init() {
	taskService = NewTaskService()
}

func HandleError(err error, rw http.ResponseWriter) {
	rw.WriteHeader(503)
	rw.Write([]byte(err.Error()))
}

func CompressFile(rw http.ResponseWriter, r *http.Request) {

	r.ParseForm()

	file, handler, err := r.FormFile("file")
	if err != nil {
		HandleError(err, rw)
		return
	}
	defer file.Close()

	setting := r.FormValue("setting")
	if setting == "" {
		setting = "prepress"
	}

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		HandleError(err, rw)
		return
	}
	uuid := uuid.NewString()

	inputFile := fmt.Sprintf("input/%s_%s", uuid[:6], handler.Filename)
	err = ioutil.WriteFile(inputFile, fileBytes, 0666)
	if err != nil {
		HandleError(err, rw)
		return
	}

	outFile := fmt.Sprintf("output/%s_%s_%s", setting, uuid[:6], handler.Filename)

	go func(uuid string, dataLen int) {

		defer func() {
			if err := recover(); err != nil {
				log.Println(err)
			}
		}()

		CompressPdf(inputFile, outFile, CompressSetting(setting), func() HandleProgress {

			task := &Task{
				ID:         uuid,
				TaskType:   Compress,
				Name:       path.Base(inputFile),
				OutName:    path.Base(outFile),
				CreateTime: time.Now().Unix(),
				Status:     Ready,
				Progress:   0,
				Size:       int64(dataLen),
			}

			taskId := taskService.AddTask(task)

			return func(progress float32, status HandleStatus, reason string) {
				if status == Start {
					taskService.UpdateTask(taskId, Start, progress, "")
				} else if status == Compressing {
					taskService.UpdateTask(taskId, Compressing, progress, "")
				} else if status == Success {
					fi, _ := os.Stat(outFile)
					taskService.UpdateTaskFileSize(taskId, fi.Size())
				} else if status == Error {
					taskService.UpdateTask(taskId, Error, progress, reason)
				}
			}
		}())

	}(uuid, len(fileBytes))

	rw.WriteHeader(200)
	rw.Write([]byte(fmt.Sprintf(`{"taskID" : "%s"}`, uuid)))

}

func OCRFile(rw http.ResponseWriter, r *http.Request) {

	r.ParseForm()

	file, handler, err := r.FormFile("file")
	if err != nil {
		HandleError(err, rw)
		return
	}
	defer file.Close()

	languages := []string{}
	languagesStr := r.FormValue("languages")
	if languagesStr != "" {
		languages = strings.Split(languagesStr, ",")
	}

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		HandleError(err, rw)
		return
	}
	uuid := uuid.NewString()

	inputFile := fmt.Sprintf("input/%s_%s", uuid[:6], handler.Filename)
	err = ioutil.WriteFile(inputFile, fileBytes, 0666)
	if err != nil {
		HandleError(err, rw)
		return
	}

	outFile := fmt.Sprintf("output/%s_%s.txt", uuid[:6], handler.Filename)

	go func(uuid string, dataLen int) {

		defer func() {
			if err := recover(); err != nil {
				log.Println(err)
			}
		}()

		OCRPdf(inputFile, outFile, languages, func() HandleProgress {

			task := &Task{
				ID:         uuid,
				TaskType:   OCR,
				Name:       path.Base(inputFile),
				OutName:    path.Base(outFile),
				CreateTime: time.Now().Unix(),
				Status:     Ready,
				Progress:   0,
				Size:       int64(dataLen),
			}

			taskId := taskService.AddTask(task)

			return func(progress float32, status HandleStatus, reason string) {
				if status == Start {
					taskService.UpdateTask(taskId, Start, progress, "")
				} else if status == Compressing {
					taskService.UpdateTask(taskId, Compressing, progress, "")
				} else if status == Success {
					fi, _ := os.Stat(outFile)
					taskService.UpdateTaskFileSize(taskId, fi.Size())
				} else if status == Error {
					taskService.UpdateTask(taskId, Error, progress, reason)
				}
			}
		}())

	}(uuid, len(fileBytes))

	rw.WriteHeader(200)
	rw.Write([]byte(fmt.Sprintf(`{"taskID" : "%s"}`, uuid)))

}

func GetTask(rw http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	taskId := r.FormValue("taskId")
	task, err := taskService.GetTask(taskId)
	if err != nil {
		HandleError(err, rw)
		return
	}

	data, _ := json.Marshal(task)
	rw.Write(data)
}

func Download(rw http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	taskId := r.FormValue("taskId")
	task, err := taskService.GetTask(taskId)
	if err != nil {
		HandleError(err, rw)
		return
	}

	data, err := ioutil.ReadFile(fmt.Sprintf("output/%s", task.OutName))
	if err != nil {
		HandleError(err, rw)
		return
	}

	rw.Header().Add("Content-Length", strconv.Itoa(len(data)))
	rw.Header().Add("Content-Type", "application/octet-stream")
	rw.Header().Add("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, task.OutName))
	rw.Write(data)
}

func Tasks(rw http.ResponseWriter, r *http.Request) {
	tasks := taskService.GetTaskList()
	data, _ := json.Marshal(tasks)
	rw.Write(data)
}

func main() {

	http.HandleFunc("/api/compress", CompressFile)
	http.HandleFunc("/api/ocr", OCRFile)
	http.HandleFunc("/api/task", GetTask)
	http.HandleFunc("/api/tasks", Tasks)
	http.HandleFunc("/download", Download)
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	log.Println("服务已经启动......")
	log.Fatal(http.ListenAndServe(":8082", nil))

}
