package main

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

type HandleStatus int
type CompressSetting string

const (
	Ready HandleStatus = iota
	Start
	Compressing
	Success
	Error
)

const (
	Prepress CompressSetting = "prepress"
	Ebook    CompressSetting = "ebook"
	Screen   CompressSetting = "screen"
)

const (
	English            string = "eng"
	SimplifiedChinese  string = "chi_sim+chi_sim_vert"
	TraditionalChinese string = "chi_tra+chi_tra_vert"
	Japanse            string = "jpn+jpn_vert"
	korea              string = "kor+kor_vert"
)

var DefaultOCRLanguages []string = []string{English, SimplifiedChinese}

type CommandWriter struct {
	totalPage  int
	handlePage int
	progress   HandleProgress
	state      HandleStatus
}

func NewCommandWriter(progress HandleProgress) *CommandWriter {
	return &CommandWriter{
		totalPage:  0,
		handlePage: 0,
		progress:   progress,
	}
}

func (w *CommandWriter) Write(p []byte) (n int, err error) {

	output := string(p)
	lines := strings.Split(output, "\n")
	for _, line := range lines {
		fmt.Println(line)
		if strings.HasPrefix(line, "Processing pages") {
			w.totalPage, _ = strconv.Atoi(line[strings.Index(line, "through ")+8 : len(line)-1])
			w.progress(float32(1)/float32(w.totalPage), Start, "")
		} else if strings.HasPrefix(line, "Page ") {
			w.handlePage, _ = strconv.Atoi(line[5:])
			w.progress(float32(w.handlePage)/float32(w.totalPage), Compressing, "")
		} else if strings.Contains(line, "error") && w.state != Error {
			reason := line[strings.Index(line, "error")+6:]
			w.progress(1, Error, reason)
			w.state = Error
		} else if strings.Contains(line, "Error") && w.state != Error {
			reason := line[strings.Index(line, "Error")+6:]
			w.progress(1, Error, reason)
			w.state = Error
		}
	}

	return len(p), nil
}

type HandleProgress func(progress float32, status HandleStatus, reason string)

func CompressPdf(inputFile string, outputFile string, setting CompressSetting, progress HandleProgress) {
	cmd := exec.Command("/usr/bin/gs", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4", fmt.Sprintf("-dPDFSETTINGS=/%s", string(setting)),
		"-dNOPAUSE", "-dBATCH", fmt.Sprintf("-sOutputFile=%s", outputFile), inputFile)

	commandWriter := NewCommandWriter(progress)
	cmd.Stdout = commandWriter
	cmd.Stderr = commandWriter

	err := cmd.Run()
	if err == nil {
		progress(1, Success, "")
	}
}

func OCRPdf(inputFile string, outputFile string, languages []string, progress HandleProgress) {

	cmd := exec.Command("/usr/bin/gs", "-sDEVICE=ocr", fmt.Sprintf(`-sOCRLanguage="%s"`, strings.Join(append(DefaultOCRLanguages, languages...), "+")), "-o", outputFile, "-r600", "-dDownScaleFactor=3", inputFile)

	commandWriter := NewCommandWriter(progress)
	cmd.Stdout = commandWriter
	cmd.Stderr = commandWriter

	err := cmd.Run()
	if err == nil {
		progress(1, Success, "")
	} else {
		if commandWriter.state != Error {
			progress(0, Error, err.Error())
		}
	}
}
