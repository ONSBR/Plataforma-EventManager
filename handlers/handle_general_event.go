package handlers

import (
	"fmt"

	"github.com/ONSBR/Plataforma-EventManager/actions"
	"github.com/ONSBR/Plataforma-EventManager/processor"
	"github.com/ONSBR/Plataforma-EventManager/sdk"
	log "github.com/sirupsen/logrus"
)

//HandleGeneralEvent handle general event
func HandleGeneralEvent(c *processor.Context) error {
	log.Debug(fmt.Sprintf("HandleGeneralEvent %s on branch %s with scope %s", c.Event.Name, c.Event.Branch, c.Event.Scope))
	if c.Event.IsReproduction() {
		return handleReproductionGeneralEvent(c)
	}
	if c.Event.IsReprocessing() {
		return handleReprocessingGeneralEvent(c)
	}
	if c.Event.IsExecution() {
		return handleExecutionGeneralEvent(c)
	}
	return nil
}

func handleExecutionGeneralEvent(c *processor.Context) error {
	if events, err := actions.SplitEvent(c.Event); err != nil {
		log.Error(err)
		return err
	} else if err := actions.SaveSplitState(events); err != nil {
		log.Error(err)
		return err
	} else {
		isRecording, err := sdk.IsRecording(c.Event.SystemID)
		if err != nil {
			log.Error(err)
		}
		for _, event := range events {
			if isRecording {
				if err := c.Publish(fmt.Sprintf("replay_%s", c.Event.SystemID), event); err != nil {
					log.Error(err)
					return err
				}
			} else {
				var processIds []string
				for _, operation := range c.Event.Bindings {
					log.Info(fmt.Sprintf("Pushing %s", operation.ProcessID))
					if contains(processIds, operation.ProcessID) {
						log.Info(fmt.Sprintf("Already pushed %s", operation.ProcessID))
						continue
					}
					processIds = append(processIds, operation.ProcessID)
					event.Version = operation.Version
					event.ProcessID = operation.ProcessID
					event.OperationID = operation.ID
					if err := c.Publish("store.executor", event); err != nil {
						log.Error(err)
						return err
					}
				}
			}

		}
	}
	return nil
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func handleReprocessingGeneralEvent(c *processor.Context) error {
	var event = c.Event
	var processIds []string
	for _, operation := range c.Event.Bindings {
		if operation.Image == c.Event.Image {
			if contains(processIds, operation.ProcessID) {
				log.Info(fmt.Sprintf("Already pushed %s", operation.ProcessID))
				continue
			}

			processIds = append(processIds, operation.ProcessID)

			event.Version = operation.Version
			event.ProcessID = operation.ProcessID
			event.OperationID = operation.ID
			if err := c.Publish("store.executor", event); err != nil {
				log.Error(err)
				return err
			}
		}
	}
	return nil
}

func handleReproductionGeneralEvent(c *processor.Context) error {
	var event = c.Event
	var processIds []string
	for _, operation := range c.Event.Bindings {
		if operation.Image == c.Event.Image {
			if contains(processIds, operation.ProcessID) {
				log.Info(fmt.Sprintf("Already pushed %s", operation.ProcessID))
				continue
			}

			processIds = append(processIds, operation.ProcessID)

			event.Version = operation.Version
			event.ProcessID = operation.ProcessID
			event.OperationID = operation.ID
			if err := c.Publish("store.executor", event); err != nil {
				log.Error(err)
				return err
			}
		}
	}
	return nil
}
