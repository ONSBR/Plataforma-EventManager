package middlewares

import (
	"fmt"

	"github.com/ONSBR/Plataforma-EventManager/processor"
	"github.com/ONSBR/Plataforma-EventManager/sdk"
	"github.com/ONSBR/Plataforma-EventManager/util"
	log "github.com/sirupsen/logrus"
)

//EnrichEvent get event bindings on event store
func EnrichEvent(c *processor.Context) (err error) {
	c.Event.ApplyDefaultFields()
	if c.Event.Version == "" {
		c.Event.Bindings, err = sdk.EventBindingsList(c.Event.Name)
		if err == nil && len(c.Event.Bindings) > 0 {
			c.Event.SystemID = c.Event.Bindings[0].SystemID
			c.Event.Version = c.Event.Bindings[0].Version
		}
	} else {
		c.Event.Bindings, err = sdk.EventBindingsByVersion(c.Event.Name, c.Event.Version)
		if err != nil {
			return err
		}
		if len(c.Event.Bindings) > 0 {
			c.Event.SystemID = c.Event.Bindings[0].SystemID
		} else {
			log.Error(fmt.Sprintf("no binding found for event %s with version %s", c.Event.Name, c.Event.Version))
		}
	}
	log.Info(fmt.Sprintf("Count %d binding for event %s with version %s", len(c.Event.Bindings), c.Event.Name, c.Event.Version))
	if c.Event.IdempotencyKey != "" {
		return
	}
	attrs := map[string]interface{}{
		"name":    c.Event.Name,
		"version": c.Event.Version,
		"system":  c.Event.SystemID,
		"payload": c.Event.Payload,
	}
	key, err := util.SHA1(attrs)
	if err != nil {
		return err
	}
	c.Event.IdempotencyKey = key
	return
}
