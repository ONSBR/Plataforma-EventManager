package factories

import (
	"sync"

	"github.com/ONSBR/Plataforma-EventManager/bus"
)

var broker bus.Dispatcher
var once sync.Once

//GetDispatcher build dispatcher component
func GetDispatcher() bus.Dispatcher {
	once.Do(func() {
		broker = bus.GetBroker()
	})
	return broker
}

//GetBroker build dispatcher component
func GetBroker() bus.Dispatcher {
	once.Do(func() {
		broker = bus.GetBroker()
	})
	return broker
}
