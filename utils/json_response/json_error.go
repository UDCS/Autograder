package json_response

type (
	JSONError struct {
		Error string `json:"error"`
	}
	JSONMessage struct {
		Message string `json:"message"`
	}
)

func NewError(err string) JSONError {
	return JSONError{Error: err}
}

func NewMessage(msg string) JSONMessage {
	return JSONMessage{Message: msg}
}
