package actions

import (
	"fmt"

	"github.com/ONSBR/Plataforma-EventManager/domain"
	"github.com/ONSBR/Plataforma-EventManager/infra"
	"github.com/ONSBR/Plataforma-EventManager/sdk"
	log "github.com/sirupsen/logrus"
)

//SplitEvent splits an event into a commands based on opened branches
func SplitEvent(event *domain.Event) ([]*domain.Event, error) {
	commands := []*domain.Event{event}
	if !isSplitable(event) {
		return commands, nil
	}
	operation := event.Bindings[0]
	if branches, err := sdk.GetOpenBranchesBySystem(operation.SystemID); err != nil {
		return nil, err
	} else if len(branches) > 0 {
		for _, branch := range branches {
			command := new(domain.Event)
			if err := infra.Clone(event, command); err != nil {
				return nil, err
			}
			command.Branch = branch.Name
			command.Bindings = []*domain.Operation{operation}
			commands = append(commands, command)
		}
	}
	log.Debug(fmt.Sprintf("Splitting event into %d commands", len(commands)))
	for i, cmd := range commands {
		log.Debug(fmt.Sprintf("command %d: name: %s branch: %s scope: %s", i+1, cmd.Name, cmd.Branch, cmd.Scope))
	}
	return commands, nil
}

func isSplitable(event *domain.Event) bool {
	return false
}
