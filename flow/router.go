package flow

import (
	"github.com/ONSBR/Plataforma-EventManager/handlers"
	"github.com/ONSBR/Plataforma-EventManager/handlers/middlewares"
	"github.com/ONSBR/Plataforma-EventManager/infra/factories"
	"github.com/ONSBR/Plataforma-EventManager/processor"
	"github.com/ONSBR/Plataforma-EventManager/sdk"
	log "github.com/sirupsen/logrus"
)

//GetDefaultProcessor return a new processor with two middlewares pre configured
func GetDefaultProcessor() *processor.Processor {
	p := processor.NewProcessor(factories.GetDispatcher())
	p.Use("*", middlewares.EnrichEvent)
	p.Use("*", middlewares.EventHasSubscribers)
	p.Use("*", middlewares.Doorkeeper)
	return p
}

//GetBasicEventRouter is available for presentations apps that just want save events to event store
func GetBasicEventRouter() *processor.Processor {
	p := GetDefaultProcessor()
	p.When("system.*", func(c *processor.Context) error {
		return c.Publish("store.executor", c.Event)
	})
	p.When("*", func(c *processor.Context) error {
		/*
			if err := actions.SaveSplitState([]*domain.Event{c.Event}); err != nil {
				log.Error(err)
				return err
			}*/
		isRecording, err := sdk.IsRecording(c.Event.SystemID)
		if err != nil {
			log.Error(err)
		}
		if isRecording {
			if err := sdk.RecordEvent(c.Event); err != nil {
				log.Error(err)
			}

		}
		return c.Publish("store", c.Event)
	})
	return p
}

//GetEventRouter return a configured event binding routes
func GetEventRouter() *processor.Processor {
	p := GetDefaultProcessor()
	p.When("*.persist.request", handlers.HandlePersistenceEvent)
	p.When("*.exception", handlers.HandleExceptionEvent)
	p.When("*.error", handlers.HandleExceptionEvent)
	p.When("*.done", handlers.HandleDoneEvent)
	p.When("system.*", handlers.HandleSystemEvent)
	p.When("*", handlers.HandleGeneralEvent)
	return p
}
