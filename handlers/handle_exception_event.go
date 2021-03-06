package handlers

import (
	"fmt"

	"github.com/ONSBR/Plataforma-EventManager/processor"
	log "github.com/sirupsen/logrus"
)

//HandleExceptionEvent handle exception events
func HandleExceptionEvent(c *processor.Context) error {
	log.Debug(fmt.Sprintf("HandleExceptionEvent %s on branch %s", c.Event.Name, c.Event.Branch))
	/*
		if c.Event.IsReprocessing() {
			if err := sdk.SetReprocessingFailure(c.Event); err != nil {
				log.Error(err)
			}
		}

		splitState, err := actions.GetSplitState(c.Event)
		if err != nil {
			c.Publish("store.executor.exception", c.Event)
			return err
		}
		if err := actions.UpdateSplitState(c.Event, splitState, domain.Error); err != nil {
			c.Publish("store.executor.exception", c.Event)
			return err
		}
	*/
	return c.Publish("store.executor.exception", c.Event)
}
