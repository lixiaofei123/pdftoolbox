package main

import (
	"fmt"
	"sync"
)

type TaskType string

const (
	Compress TaskType = "compress"
	OCR      TaskType = "ocr"
)

type Task struct {
	ID         string       `json:"id"`
	TaskType   TaskType     `json:"taskType"`
	CreateTime int64        `json:"createTime"`
	Name       string       `json:"name"`
	OutName    string       `json:"outName"`
	Status     HandleStatus `json:"status"`
	Progress   float32      `json:"progress"`
	Reason     string       `json:"reason"`
	Size       int64        `json:"size"`
	Size2      int64        `json:"size2"`
}

type TaskService struct {
	taskList *sync.Map
	lock     *sync.RWMutex
}

func NewTaskService() *TaskService {
	taskList := sync.Map{}
	lock := sync.RWMutex{}
	return &TaskService{
		taskList: &taskList,
		lock:     &lock,
	}
}

func (t *TaskService) AddTask(task *Task) string {

	t.lock.Lock()
	t.taskList.Store(task.ID, task)
	t.lock.Unlock()
	return task.ID
}

func (t *TaskService) GetTask(id string) (*Task, error) {
	t.lock.RLock()
	task, ok := t.taskList.Load(id)
	t.lock.RUnlock()

	if ok {
		return task.(*Task), nil
	}
	return nil, fmt.Errorf("unexist task [%s]", id)
}

func (t *TaskService) GetTaskList() []*Task {
	tasks := []*Task{}
	t.lock.RLock()
	t.taskList.Range(func(key, value interface{}) bool {
		tasks = append(tasks, value.(*Task))
		return true
	})
	t.lock.RUnlock()

	return tasks
}

func (t *TaskService) UpdateTask(id string, status HandleStatus, progress float32, reason string) error {
	t.lock.RLock()
	taskInter, ok := t.taskList.Load(id)
	t.lock.RUnlock()

	if ok {
		t.lock.Lock()
		task := taskInter.(*Task)
		task.Status = status
		task.Progress = progress
		task.Reason = reason
		t.taskList.Store(id, task)
		t.lock.Unlock()
	}
	return fmt.Errorf("unexist task [%s]", id)
}

func (t *TaskService) UpdateTaskFileSize(id string, size2 int64) error {
	t.lock.RLock()
	taskInter, ok := t.taskList.Load(id)
	t.lock.RUnlock()

	if ok {
		t.lock.Lock()
		task := taskInter.(*Task)
		task.Status = Success
		task.Progress = 1
		task.Size2 = size2
		t.taskList.Store(id, task)
		t.lock.Unlock()
	}
	return fmt.Errorf("unexist task [%s]", id)
}

func (t *TaskService) DelTask(id string) {
	t.lock.Lock()
	t.taskList.Delete(id)
	t.lock.Unlock()
}
